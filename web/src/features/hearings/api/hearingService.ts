import { apiClient, getErrorMessage } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type {
  CalendarResponse,
  HearingDetails,
  HearingListResponse,
  HearingOutcomePayload,
  HearingPagination,
  HearingPayload,
  HearingPersonRef,
  HearingReschedulePayload,
  HearingStatsSummary,
  HearingStatus,
  HearingType,
  SortDirection,
} from '../types'

export interface HearingListParams {
  search?: string
  status: HearingStatus | 'ALL'
  type: HearingType | 'ALL'
  sortBy: string
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

export const hearingService = {
  async getHearings(params: HearingListParams): Promise<HearingListResponse> {
    try {
      const { data } = await apiClient.get<HearingListResponse>(endpoints.hearings.root, {
        params: {
          search: params.search || undefined,
          status: params.status !== 'ALL' ? params.status : undefined,
          hearingType: params.type !== 'ALL' ? params.type : undefined,
          sortBy: params.sortBy,
          sortDir: params.sortDir,
          page: params.page,
          pageSize: params.pageSize,
        },
      })
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load hearings.'))
    }
  },

  async getHearingStats(): Promise<HearingStatsSummary | null> {
    return null
  },

  async getHearing(id: string): Promise<HearingDetails | null> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: HearingDetails }>(
        endpoints.hearings.byId(id),
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load hearing.'))
    }
  },

  async createHearing(payload: HearingPayload): Promise<HearingDetails | null> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: HearingDetails }>(
        endpoints.hearings.root,
        payload,
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create hearing.'))
    }
  },

  async updateHearing(id: string, payload: Partial<HearingPayload>): Promise<HearingDetails | null> {
    try {
      const { data } = await apiClient.patch<{ success: boolean; data: HearingDetails }>(
        endpoints.hearings.byId(id),
        payload,
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update hearing.'))
    }
  },

  async deleteHearing(id: string): Promise<void> {
    try {
      await apiClient.delete(endpoints.hearings.byId(id))
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to delete hearing.'))
    }
  },

  async deleteHearings(ids: string[]): Promise<void> {
    for (const id of ids) {
      await hearingService.deleteHearing(id).catch(() => {})
    }
  },

  async updateOutcome(id: string, payload: HearingOutcomePayload): Promise<HearingDetails | null> {
    try {
      const { data } = await apiClient.patch<{ success: boolean; data: HearingDetails }>(
        endpoints.hearings.outcome(id),
        payload,
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update outcome.'))
    }
  },

  async rescheduleHearing(id: string, payload: HearingReschedulePayload): Promise<HearingDetails | null> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: HearingDetails }>(
        endpoints.hearings.reschedule(id),
        payload,
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to reschedule hearing.'))
    }
  },

  async getCalendarEvents(params: CalendarParams): Promise<CalendarResponse> {
    try {
      const { data } = await apiClient.get<{ success: boolean; items: any[] }>(
        endpoints.hearings.calendar,
        { params },
      )
      const hearings = data.items ?? []
      return {
        events: hearings.map((h: any) => ({
          id: h.id,
          title: h.title,
          start: h.scheduledAt,
          end: h.scheduledAt,
          type: 'HEARING',
          status: h.status,
          caseId: h.caseId ?? null,
          caseTitle: h.case?.title ?? null,
          location: h.location ?? h.courtName ?? null,
          assignedTo: h.assignedLawyer ? [h.assignedLawyer] : [],
        })),
        upcoming: [],
        capacity: null,
      }
    } catch {
      return { events: [], upcoming: [], capacity: null }
    }
  },

  async getAssignableLawyers(search?: string): Promise<HearingPersonRef[]> {
    try {
      const { data } = await apiClient.get<{ success: boolean; items: any[] }>(
        endpoints.users.root,
        { params: { search: search || undefined, role: 'LAWYER', pageSize: 50 } },
      )
      return (data.items ?? []).map((m: any) => ({
        id: m.userId ?? m.id,
        fullName: m.user?.fullName ?? m.fullName ?? '',
        avatarUrl: m.user?.avatarUrl ?? null,
        role: m.role ?? 'LAWYER',
      }))
    } catch {
      return []
    }
  },
}
