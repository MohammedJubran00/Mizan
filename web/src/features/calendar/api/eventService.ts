import type {
  CalendarEventItem,
  CalendarSource,
  EventAttachment,
  EventCategory,
  EventCompletionPayload,
  EventDetails,
  EventListResponse,
  EventPagination,
  EventPayload,
  EventPersonRef,
  EventPriority,
  EventReschedulePayload,
  EventSortField,
  EventStatus,
  SortDirection,
} from '../types'

export interface EventListParams {
  search?: string
  /** Inclusive ISO range covering the visible calendar window. */
  from?: string
  to?: string
  category: EventCategory | 'ALL'
  priority: EventPriority | 'ALL'
  status: EventStatus | 'ALL'
  lawyerId?: string
  clientId?: string
  caseId?: string
  /** Categories the user switched off in the sidebar. */
  hiddenCategories?: EventCategory[]
  /** Calendars the user switched off in the sidebar. */
  hiddenCalendarIds?: string[]
  sortBy: EventSortField
  sortDir: SortDirection
  page: number
  pageSize: number
}

function emptyPagination(page: number, pageSize: number): EventPagination {
  return { page, pageSize, total: 0, totalPages: 0, hasMore: false }
}

/**
 * TODO: No CalendarEvent model in Prisma — generic event CRUD is unimplemented.
 * Hearing-backed calendar data lives in `hearingService.getCalendarEvents`.
 * This service returns empty results so the Calendar UI shows an empty state.
 */
export const eventService = {
  async getEvents(params: EventListParams): Promise<EventListResponse> {
    return {
      items: [],
      pagination: emptyPagination(params.page, params.pageSize),
    }
  },

  async getEvent(_id: string): Promise<EventDetails | null> {
    return null
  },

  async createEvent(_payload: EventPayload): Promise<EventDetails | null> {
    return null
  },

  async updateEvent(
    _id: string,
    _payload: Partial<EventPayload>,
  ): Promise<EventDetails | null> {
    return null
  },

  async deleteEvent(_id: string): Promise<void> {
    return Promise.resolve()
  },

  async completeEvent(
    _id: string,
    _payload: EventCompletionPayload,
  ): Promise<EventDetails | null> {
    return null
  },

  async rescheduleEvent(
    _id: string,
    _payload: EventReschedulePayload,
  ): Promise<EventDetails | null> {
    return null
  },

  async uploadAttachment(
    _eventId: string,
    _file: File,
  ): Promise<EventAttachment | null> {
    return null
  },

  /** Resolves with the file blob once the API can stream attachments. */
  async downloadAttachment(
    _eventId: string,
    _attachmentId: string,
  ): Promise<Blob | null> {
    return null
  },

  async getUpcomingEvents(_limit = 5): Promise<CalendarEventItem[]> {
    return []
  },

  /** Calendars the user can toggle on and off in the sidebar. */
  async getCalendars(): Promise<CalendarSource[]> {
    return []
  },

  async getAssignableLawyers(_search?: string): Promise<EventPersonRef[]> {
    return []
  },
}
