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
import { hearingTypeLabels } from '../lib/labels'

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

/** Map UI form payload → backend create/update DTO. */
function toApiHearingBody(payload: Partial<HearingPayload>) {
  const body: Record<string, unknown> = {}

  if (payload.caseId !== undefined) {
    body.caseId = payload.caseId || null
  }

  if (payload.type !== undefined) {
    body.hearingType = payload.type || 'OTHER'
  }

  if (payload.date && payload.time) {
    body.scheduledAt = `${payload.date}T${payload.time}:00`
  }

  if (payload.durationMinutes !== undefined) {
    body.durationMinutes = payload.durationMinutes
      ? Number(payload.durationMinutes)
      : null
  }

  if (payload.court !== undefined) {
    body.courtName = payload.court.trim() || null
  }

  if (payload.room !== undefined) {
    body.room = payload.room.trim() || null
  }

  if (payload.judgeName !== undefined) {
    body.judgeName = payload.judgeName.trim() || null
  }

  if (payload.leadLawyerId !== undefined) {
    body.assignedLawyerId = payload.leadLawyerId || null
  }

  if (payload.notes !== undefined) {
    body.notes = payload.notes.trim() || null
  }

  if (payload.reminderDate !== undefined) {
    body.reminderAt = payload.reminderDate
      ? `${payload.reminderDate}T09:00:00`
      : null
  }

  // Backend requires a title — derive one from type + court when creating.
  if (payload.type || payload.court) {
    const typeLabel =
      payload.type && payload.type in hearingTypeLabels
        ? hearingTypeLabels[payload.type as HearingType]
        : 'Hearing'
    const court = payload.court?.trim()
    body.title = court ? `${typeLabel} — ${court}` : typeLabel
  }

  return body
}

function normalizeHearingDetails(raw: any): HearingDetails {
  const scheduledAt = raw.scheduledAt ?? new Date().toISOString()
  const caseRef = raw.case
    ? {
        id: raw.case.id,
        caseNumber: raw.case.caseNumber ?? raw.case.id.slice(0, 8).toUpperCase(),
        title: raw.case.title,
      }
    : (raw.caseRef ?? null)

  const client = raw.case?.client
    ? {
        id: raw.case.client.id,
        fullName: raw.case.client.name ?? raw.case.client.fullName ?? '',
        email: raw.case.client.email ?? null,
        phone: raw.case.client.phone ?? null,
        avatarUrl: raw.case.client.avatarUrl ?? null,
      }
    : (raw.client ?? null)

  const leadLawyer = raw.assignedLawyer
    ? {
        id: raw.assignedLawyer.id,
        fullName: raw.assignedLawyer.fullName,
        email: raw.assignedLawyer.email ?? null,
        avatarUrl: raw.assignedLawyer.avatarUrl ?? null,
      }
    : (raw.leadLawyer ?? null)

  return {
    id: raw.id,
    type: raw.hearingType ?? raw.type ?? 'OTHER',
    status: raw.status ?? 'SCHEDULED',
    scheduledAt,
    durationMinutes: raw.durationMinutes ?? null,
    court: raw.courtName ?? raw.court ?? null,
    room: raw.room ?? null,
    judgeName: raw.judgeName ?? null,
    notes: raw.notes ?? null,
    summary: raw.notes ?? null,
    outcome: raw.outcome
      ? {
          result: raw.outcome,
          judgeDecision: null,
          summary: raw.notes ?? null,
          nextAction: raw.nextAction ?? null,
          scheduleFollowUp: false,
          recordedAt: raw.updatedAt ?? scheduledAt,
        }
      : (raw.outcomeRecord ?? null),
    caseRef,
    client,
    leadLawyer,
    reminder: {
      notifyClient: Boolean(raw.reminderAt),
      date: raw.reminderAt ?? '',
      email: true,
      sms: false,
    },
    pendingActions: raw.pendingActions ?? [],
    nextActionLabel: raw.nextAction ?? null,
    timeline: raw.timeline ?? [],
    documents: raw.documents ?? [],
    notesList: raw.notesList ?? [],
    transcriptUrl: raw.transcriptUrl ?? null,
    createdAt: raw.createdAt ?? scheduledAt,
    updatedAt: raw.updatedAt ?? scheduledAt,
  }
}

export const hearingService = {
  async getHearings(params: HearingListParams): Promise<HearingListResponse> {
    try {
      const { data } = await apiClient.get<any>(endpoints.hearings.root, {
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
      return {
        items: (data.items ?? []).map((item: any) => ({
          id: item.id,
          type: item.hearingType ?? item.type ?? 'OTHER',
          status: item.status ?? 'SCHEDULED',
          scheduledAt: item.scheduledAt,
          durationMinutes: item.durationMinutes ?? null,
          court: item.courtName ?? item.court ?? null,
          room: item.room ?? null,
          judgeName: item.judgeName ?? null,
          caseRef: item.case
            ? {
                id: item.case.id,
                caseNumber: item.case.caseNumber ?? '',
                title: item.case.title,
              }
            : (item.caseRef ?? null),
          client: item.case?.client
            ? {
                id: item.case.client.id,
                fullName: item.case.client.name ?? '',
              }
            : (item.client ?? null),
          leadLawyer: item.assignedLawyer
            ? {
                id: item.assignedLawyer.id,
                fullName: item.assignedLawyer.fullName,
              }
            : (item.leadLawyer ?? null),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        pagination: data.pagination ?? emptyPagination(params.page, params.pageSize),
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load hearings.'))
    }
  },

  async getHearingStats(): Promise<HearingStatsSummary | null> {
    return null
  },

  async getHearing(id: string): Promise<HearingDetails | null> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: any }>(
        endpoints.hearings.byId(id),
      )
      return data.data ? normalizeHearingDetails(data.data) : null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load hearing.'))
    }
  },

  async createHearing(payload: HearingPayload): Promise<HearingDetails | null> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: any }>(
        endpoints.hearings.root,
        toApiHearingBody(payload),
      )
      return data.data ? normalizeHearingDetails(data.data) : null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create hearing.'))
    }
  },

  async updateHearing(
    id: string,
    payload: Partial<HearingPayload>,
  ): Promise<HearingDetails | null> {
    try {
      const { data } = await apiClient.patch<{ success: boolean; data: any }>(
        endpoints.hearings.byId(id),
        toApiHearingBody(payload),
      )
      return data.data ? normalizeHearingDetails(data.data) : null
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
    for (const hearingId of ids) {
      await hearingService.deleteHearing(hearingId).catch(() => {})
    }
  },

  async updateOutcome(
    id: string,
    payload: HearingOutcomePayload,
  ): Promise<HearingDetails | null> {
    try {
      const { data } = await apiClient.patch<{ success: boolean; data: any }>(
        endpoints.hearings.outcome(id),
        {
          outcome: payload.result || undefined,
          nextAction: payload.nextAction || null,
          notes: payload.summary || payload.judgeDecision || null,
        },
      )
      return data.data ? normalizeHearingDetails(data.data) : null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update outcome.'))
    }
  },

  async rescheduleHearing(
    id: string,
    payload: HearingReschedulePayload,
  ): Promise<HearingDetails | null> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: any }>(
        endpoints.hearings.reschedule(id),
        {
          scheduledAt: `${payload.date}T${payload.time}:00`,
          reason: payload.reason || undefined,
        },
      )
      return data.data ? normalizeHearingDetails(data.data) : null
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
          hearingId: h.id,
          title: h.title,
          caseNumber: h.case?.caseNumber ?? null,
          scheduledAt: h.scheduledAt,
          endAt: null,
          court: h.courtName ?? h.location ?? null,
          room: h.room ?? null,
          status: h.status,
          type: h.hearingType ?? h.type ?? 'OTHER',
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
