import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/stores/toastStore'

import {
  hearingService,
  type CalendarParams,
  type HearingListParams,
} from '../api/hearingService'
import type {
  CalendarEvent,
  HearingDetails,
  HearingListItem,
  HearingOutcomePayload,
  HearingPayload,
  HearingReschedulePayload,
} from '../types'

export const hearingKeys = {
  all: ['hearings'] as const,
  list: (params: HearingListParams) => ['hearings', 'list', params] as const,
  stats: () => ['hearings', 'stats'] as const,
  detail: (id: string) => ['hearings', 'detail', id] as const,
  calendar: (params: CalendarParams) => ['hearings', 'calendar', params] as const,
}

export type HearingResourceState = 'loading' | 'error' | 'empty' | 'ready'

const NO_ITEMS: HearingListItem[] = []
const NO_EVENTS: CalendarEvent[] = []

function describeError(error: unknown) {
  return error instanceof Error ? error.message : 'Please try again.'
}

export function useHearingList(params: HearingListParams) {
  const query = useQuery({
    queryKey: hearingKeys.list(params),
    queryFn: () => hearingService.getHearings(params),
  })

  const items = query.data?.items ?? NO_ITEMS

  const state: HearingResourceState = query.isPending
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

export function useHearingStats() {
  const query = useQuery({
    queryKey: hearingKeys.stats(),
    queryFn: () => hearingService.getHearingStats(),
  })

  return {
    stats: query.data ?? null,
    isLoading: query.isPending,
    isError: query.isError,
  }
}

export function useHearingDetails(id: string | undefined) {
  const query = useQuery({
    queryKey: hearingKeys.detail(id ?? 'unknown'),
    queryFn: () => hearingService.getHearing(id as string),
    enabled: Boolean(id),
  })

  const hearing: HearingDetails | null = query.data ?? null

  const state: HearingResourceState = !id
    ? 'empty'
    : query.isPending
      ? 'loading'
      : query.isError
        ? 'error'
        : hearing === null
          ? 'empty'
          : 'ready'

  return { hearing, state, error: query.error, refetch: query.refetch }
}

export function useHearingCalendar(params: CalendarParams) {
  const query = useQuery({
    queryKey: hearingKeys.calendar(params),
    queryFn: () => hearingService.getCalendarEvents(params),
  })

  return {
    events: query.data?.events ?? NO_EVENTS,
    upcoming: query.data?.upcoming ?? NO_ITEMS,
    capacity: query.data?.capacity ?? null,
    state: (query.isPending
      ? 'loading'
      : query.isError
        ? 'error'
        : 'ready') as HearingResourceState,
    refetch: query.refetch,
  }
}

interface HearingMutationCallbacks {
  onCreated?: (created: HearingDetails | null) => void
  onUpdated?: (updated: HearingDetails | null) => void
  onDeleted?: () => void
  onOutcomeUpdated?: (updated: HearingDetails | null) => void
  onRescheduled?: (updated: HearingDetails | null) => void
}

export function useHearingMutations({
  onCreated,
  onUpdated,
  onDeleted,
  onOutcomeUpdated,
  onRescheduled,
}: HearingMutationCallbacks = {}) {
  const queryClient = useQueryClient()

  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: hearingKeys.all })

  const createHearing = useMutation({
    mutationFn: (payload: HearingPayload) => hearingService.createHearing(payload),
    onSuccess: async (created) => {
      await invalidateAll()
      toast.success('Hearing scheduled', 'The hearing was added to the calendar.')
      onCreated?.(created)
    },
    onError: (error) =>
      toast.error('Could not schedule hearing', describeError(error)),
  })

  const updateHearing = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<HearingPayload>
    }) => hearingService.updateHearing(id, payload),
    onSuccess: async (updated, variables) => {
      await queryClient.invalidateQueries({
        queryKey: hearingKeys.detail(variables.id),
      })
      await invalidateAll()
      toast.success('Hearing updated', 'Your changes have been saved.')
      onUpdated?.(updated)
    },
    onError: (error) =>
      toast.error('Could not update hearing', describeError(error)),
  })

  const deleteHearing = useMutation({
    mutationFn: (id: string) => hearingService.deleteHearing(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: hearingKeys.detail(id) })
      await invalidateAll()
      toast.success('Hearing deleted', 'The hearing and related notes were removed.')
      onDeleted?.()
    },
    onError: (error) =>
      toast.error('Could not delete hearing', describeError(error)),
  })

  const deleteHearings = useMutation({
    mutationFn: (ids: string[]) => hearingService.deleteHearings(ids),
    onSuccess: async (_result, ids) => {
      for (const id of ids) {
        queryClient.removeQueries({ queryKey: hearingKeys.detail(id) })
      }
      await invalidateAll()
      toast.success(
        `${ids.length} ${ids.length === 1 ? 'hearing' : 'hearings'} deleted`,
        'The selected hearings were removed.',
      )
      onDeleted?.()
    },
    onError: (error) =>
      toast.error('Could not delete hearings', describeError(error)),
  })

  const updateOutcome = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: HearingOutcomePayload
    }) => hearingService.updateOutcome(id, payload),
    onSuccess: async (updated, variables) => {
      await queryClient.invalidateQueries({
        queryKey: hearingKeys.detail(variables.id),
      })
      await invalidateAll()
      toast.success('Outcome saved', 'The hearing result has been recorded.')
      onOutcomeUpdated?.(updated)
    },
    onError: (error) =>
      toast.error('Could not save outcome', describeError(error)),
  })

  const rescheduleHearing = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: HearingReschedulePayload
    }) => hearingService.rescheduleHearing(id, payload),
    onSuccess: async (updated, variables) => {
      await queryClient.invalidateQueries({
        queryKey: hearingKeys.detail(variables.id),
      })
      await invalidateAll()
      toast.success('Hearing rescheduled', 'The new date and time were saved.')
      onRescheduled?.(updated)
    },
    onError: (error) =>
      toast.error('Could not reschedule hearing', describeError(error)),
  })

  return {
    createHearing,
    updateHearing,
    deleteHearing,
    deleteHearings,
    updateOutcome,
    rescheduleHearing,
    isCreating: createHearing.isPending,
    isUpdating:
      updateHearing.isPending ||
      updateOutcome.isPending ||
      rescheduleHearing.isPending,
    isDeleting: deleteHearing.isPending || deleteHearings.isPending,
  }
}
