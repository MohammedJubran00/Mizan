import type {
  CalendarResponse,
  HearingDetails,
  HearingListResponse,
  HearingOutcomePayload,
  HearingPagination,
  HearingPayload,
  HearingPersonRef,
  HearingReschedulePayload,
  HearingSortField,
  HearingStatsSummary,
  HearingStatus,
  HearingType,
  SortDirection,
} from '../types'

export interface HearingListParams {
  search?: string
  status: HearingStatus | 'ALL'
  type: HearingType | 'ALL'
  sortBy: HearingSortField
  sortDir: SortDirection
  page: number
  pageSize: number
}

export interface CalendarParams {
  from: string
  to: string
}

function emptyPagination(page: number, pageSize: number): HearingPagination {
  return { page, pageSize, total: 0, totalPages: 0, hasMore: false }
}

/**
 * Placeholder data access for the workspace Hearings module.
 * Replace bodies with `apiClient` calls once `/api/hearings` exists.
 */
export const hearingService = {
  async getHearings(params: HearingListParams): Promise<HearingListResponse> {
    return {
      items: [],
      pagination: emptyPagination(params.page, params.pageSize),
    }
  },

  async getHearingStats(): Promise<HearingStatsSummary | null> {
    return null
  },

  async getHearing(_id: string): Promise<HearingDetails | null> {
    return null
  },

  async createHearing(_payload: HearingPayload): Promise<HearingDetails | null> {
    return null
  },

  async updateHearing(
    _id: string,
    _payload: Partial<HearingPayload>,
  ): Promise<HearingDetails | null> {
    return null
  },

  async deleteHearing(_id: string): Promise<void> {
    return Promise.resolve()
  },

  async deleteHearings(_ids: string[]): Promise<void> {
    return Promise.resolve()
  },

  async updateOutcome(
    _id: string,
    _payload: HearingOutcomePayload,
  ): Promise<HearingDetails | null> {
    return null
  },

  async rescheduleHearing(
    _id: string,
    _payload: HearingReschedulePayload,
  ): Promise<HearingDetails | null> {
    return null
  },

  async getCalendarEvents(_params: CalendarParams): Promise<CalendarResponse> {
    return { events: [], upcoming: [], capacity: null }
  },

  async getAssignableLawyers(_search?: string): Promise<HearingPersonRef[]> {
    return []
  },
}
