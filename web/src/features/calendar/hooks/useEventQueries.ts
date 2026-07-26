import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/stores/toastStore'

import { eventService, type EventListParams } from '../api/eventService'
import { toDateInputValue, toTimeInputValue } from '../lib/calendarDates'
import type {
  CalendarEventItem,
  CalendarSource,
  EventCompletionPayload,
  EventDetails,
  EventListResponse,
  EventPayload,
  EventReschedulePayload,
} from '../types'

export const eventKeys = {
  all: ['events'] as const,
  lists: () => ['events', 'list'] as const,
  list: (params: EventListParams) => ['events', 'list', params] as const,
  detail: (id: string) => ['events', 'detail', id] as const,
  upcoming: (limit: number) => ['events', 'upcoming', limit] as const,
  calendars: () => ['events', 'calendars'] as const,
}

export type EventResourceState = 'loading' | 'error' | 'empty' | 'ready'

const NO_ITEMS: CalendarEventItem[] = []
const NO_CALENDARS: CalendarSource[] = []

function describeError(error: unknown) {
  return error instanceof Error ? error.message : 'Please try again.'
}

export function useEventList(params: EventListParams) {
  const query = useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventService.getEvents(params),
  })

  const items = query.data?.items ?? NO_ITEMS

  const state: EventResourceState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : items.length === 0
        ? 'empty'
        : 'ready'

  return {
    items,
    pagination: query.data?.pagination,
    state,
    isSearching: query.isFetching && !query.isPending,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useEventDetails(id: string | undefined) {
  const query = useQuery({
    queryKey: eventKeys.detail(id ?? 'unknown'),
    queryFn: () => eventService.getEvent(id as string),
    enabled: Boolean(id),
  })

  const event: EventDetails | null = query.data ?? null

  const state: EventResourceState = !id
    ? 'empty'
    : query.isPending
      ? 'loading'
      : query.isError
        ? 'error'
        : event === null
          ? 'empty'
          : 'ready'

  return { event, state, error: query.error, refetch: query.refetch }
}

export function useUpcomingEvents(limit = 5) {
  const query = useQuery({
    queryKey: eventKeys.upcoming(limit),
    queryFn: () => eventService.getUpcomingEvents(limit),
  })

  return {
    events: query.data ?? NO_ITEMS,
    isLoading: query.isPending,
    isError: query.isError,
  }
}

export function useCalendarSources() {
  const query = useQuery({
    queryKey: eventKeys.calendars(),
    queryFn: () => eventService.getCalendars(),
  })

  return {
    calendars: query.data ?? NO_CALENDARS,
    isLoading: query.isPending,
    isError: query.isError,
  }
}

export interface EventTimeChange {
  id: string
  startAt: string
  endAt: string
}

interface EventMutationCallbacks {
  onCreated?: (created: EventDetails | null) => void
  onUpdated?: (updated: EventDetails | null) => void
  onDeleted?: () => void
  onCompleted?: (updated: EventDetails | null) => void
  onRescheduled?: (updated: EventDetails | null) => void
}

export function useEventMutations({
  onCreated,
  onUpdated,
  onDeleted,
  onCompleted,
  onRescheduled,
}: EventMutationCallbacks = {}) {
  const queryClient = useQueryClient()

  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: eventKeys.all })

  const createEvent = useMutation({
    mutationFn: (payload: EventPayload) => eventService.createEvent(payload),
    onSuccess: async (created) => {
      await invalidateAll()
      toast.success('Event created', 'The event was added to the calendar.')
      onCreated?.(created)
    },
    onError: (error) => toast.error('Could not create event', describeError(error)),
  })

  const updateEvent = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EventPayload> }) =>
      eventService.updateEvent(id, payload),
    onSuccess: async (updated, variables) => {
      await queryClient.invalidateQueries({
        queryKey: eventKeys.detail(variables.id),
      })
      await invalidateAll()
      toast.success('Event updated', 'Your changes have been saved.')
      onUpdated?.(updated)
    },
    onError: (error) => toast.error('Could not update event', describeError(error)),
  })

  const deleteEvent = useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: eventKeys.detail(id) })
      await invalidateAll()
      toast.success('Event deleted', 'The event was removed from the calendar.')
      onDeleted?.()
    },
    onError: (error) => toast.error('Could not delete event', describeError(error)),
  })

  const completeEvent = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EventCompletionPayload }) =>
      eventService.completeEvent(id, payload),
    onSuccess: async (updated, variables) => {
      await queryClient.invalidateQueries({
        queryKey: eventKeys.detail(variables.id),
      })
      await invalidateAll()
      toast.success(
        variables.payload.completed ? 'Event completed' : 'Completion reverted',
        variables.payload.completed
          ? 'The event is now marked as completed.'
          : 'The event is back on the schedule.',
      )
      onCompleted?.(updated)
    },
    onError: (error) => toast.error('Could not update event', describeError(error)),
  })

  const rescheduleEvent = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: EventReschedulePayload
    }) => eventService.rescheduleEvent(id, payload),
    onSuccess: async (updated, variables) => {
      await queryClient.invalidateQueries({
        queryKey: eventKeys.detail(variables.id),
      })
      await invalidateAll()
      toast.success('Event rescheduled', 'The new date and time were saved.')
      onRescheduled?.(updated)
    },
    onError: (error) =>
      toast.error('Could not reschedule event', describeError(error)),
  })

  /**
   * Drag-and-drop and resize handler. The cached ranges are patched immediately
   * so the block follows the pointer, then rolled back if the API rejects it.
   */
  const moveEvent = useMutation({
    mutationFn: ({ id, startAt, endAt }: EventTimeChange) => {
      const start = new Date(startAt)
      const end = new Date(endAt)

      return eventService.rescheduleEvent(id, {
        date: toDateInputValue(start),
        startTime: toTimeInputValue(start),
        endTime: toTimeInputValue(end),
        reason: 'Moved from the calendar',
        notifyParticipants: false,
      })
    },
    onMutate: async ({ id, startAt, endAt }: EventTimeChange) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.lists() })

      const snapshot = queryClient.getQueriesData<EventListResponse>({
        queryKey: eventKeys.lists(),
      })

      queryClient.setQueriesData<EventListResponse>(
        { queryKey: eventKeys.lists() },
        (current) => {
          if (!current) return current

          return {
            ...current,
            items: current.items.map((item) =>
              item.id === id ? { ...item, startAt, endAt } : item,
            ),
          }
        },
      )

      return { snapshot }
    },
    onError: (error, _variables, context) => {
      for (const [key, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(key, data)
      }
      toast.error('Could not move event', describeError(error))
    },
    onSuccess: async (_updated, variables) => {
      await queryClient.invalidateQueries({
        queryKey: eventKeys.detail(variables.id),
      })
      toast.success('Event moved', 'The new time was saved.')
    },
    onSettled: () => invalidateAll(),
  })

  const uploadAttachment = useMutation({
    mutationFn: ({ eventId, file }: { eventId: string; file: File }) =>
      eventService.uploadAttachment(eventId, file),
    onSuccess: async (_attachment, variables) => {
      await queryClient.invalidateQueries({
        queryKey: eventKeys.detail(variables.eventId),
      })
      toast.success('Attachment uploaded', `${variables.file.name} was attached.`)
    },
    onError: (error) =>
      toast.error('Could not upload attachment', describeError(error)),
  })

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    completeEvent,
    rescheduleEvent,
    moveEvent,
    uploadAttachment,
    isCreating: createEvent.isPending,
    isUpdating:
      updateEvent.isPending ||
      completeEvent.isPending ||
      rescheduleEvent.isPending ||
      moveEvent.isPending,
    isDeleting: deleteEvent.isPending,
    isUploading: uploadAttachment.isPending,
  }
}
