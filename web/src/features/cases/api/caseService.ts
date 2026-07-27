import { apiClient, getErrorMessage } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type {
  CaseDetails,
  CaseListResponse,
  CasePagination,
  CasePayload,
  CasePersonRef,
  CasePriority,
  CaseSortField,
  CaseStatsSummary,
  CaseStatus,
  Hearing,
  HearingListResponse,
  HearingPayload,
  HearingStatus,
  PracticeArea,
  SortDirection,
} from '../types'

export interface CaseListParams {
  search?: string
  status: CaseStatus | 'ALL'
  practiceArea: PracticeArea | 'ALL'
  priority: CasePriority | 'ALL'
  sortBy: CaseSortField
  sortDir: SortDirection
  page: number
  pageSize: number
}

export interface HearingListParams {
  status: HearingStatus | 'ALL'
  page: number
  pageSize: number
}

function emptyPagination(page: number, pageSize: number): CasePagination {
  return { page, pageSize, total: 0, totalPages: 0, hasMore: false }
}

const EMPTY_BILLING = {
  totalBilled: 0,
  payments: { totalPaid: 0, outstanding: 0, currency: 'USD' },
  invoices: [],
} as const

/** Ensures every CaseDetails field the UI reads is present, even if the API omits it. */
function normalizeCaseDetails(raw: Partial<CaseDetails> & { id: string }): CaseDetails {
  const billing = raw.billing ?? EMPTY_BILLING
  return {
    id: raw.id,
    caseNumber: raw.caseNumber ?? raw.id.slice(0, 8).toUpperCase(),
    title: raw.title ?? 'Untitled case',
    description: raw.description ?? null,
    status: raw.status ?? 'OPEN',
    priority: raw.priority ?? 'MEDIUM',
    practiceArea: raw.practiceArea ?? 'OTHER',
    court: raw.court ?? null,
    judgeName: raw.judgeName ?? null,
    opposingParty: raw.opposingParty ?? null,
    opposingCounsel: raw.opposingCounsel ?? null,
    jurisdiction: raw.jurisdiction ?? null,
    client: raw.client ?? null,
    leadLawyer: raw.leadLawyer ?? null,
    team: raw.team ?? [],
    counters: raw.counters ?? {
      hearings: raw.hearings?.length ?? 0,
      documents: raw.documents?.length ?? 0,
      notes: raw.notes?.length ?? 0,
    },
    billing: {
      totalBilled: billing.totalBilled ?? 0,
      payments: billing.payments ?? EMPTY_BILLING.payments,
      invoices: billing.invoices ?? [],
    },
    milestones: raw.milestones ?? {
      filingDate: null,
      nextHearingAt: null,
      filingDeadline: null,
      discoveryDeadline: null,
      expectedClosingAt: null,
    },
    deadlines: raw.deadlines ?? [],
    timeline: raw.timeline ?? [],
    hearings: raw.hearings ?? [],
    documents: raw.documents ?? [],
    notes: raw.notes ?? [],
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
}

export const caseService = {
  async getCases(params: CaseListParams): Promise<CaseListResponse> {
    try {
      const { data } = await apiClient.get<{
        success?: boolean
        items: CaseListResponse['items']
        pagination: CaseListResponse['pagination']
      }>(endpoints.cases.root, {
        params: {
          search: params.search || undefined,
          status: params.status !== 'ALL' ? params.status : undefined,
          practiceArea:
            params.practiceArea !== 'ALL' ? params.practiceArea : undefined,
          priority: params.priority !== 'ALL' ? params.priority : undefined,
          sortBy: params.sortBy,
          sortDir: params.sortDir,
          page: params.page,
          pageSize: params.pageSize,
        },
      })
      return {
        items: data.items ?? [],
        pagination: data.pagination,
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load cases.'))
    }
  },

  async getCaseStats(): Promise<CaseStatsSummary | null> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: CaseStatsSummary }>(
        endpoints.cases.stats,
      )
      return data.data ?? null
    } catch {
      return null
    }
  },

  async getCase(id: string): Promise<CaseDetails | null> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: CaseDetails }>(
        endpoints.cases.byId(id),
      )
      return data.data ? normalizeCaseDetails(data.data) : null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load case.'))
    }
  },

  async createCase(payload: CasePayload): Promise<CaseDetails> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: CaseDetails }>(
        endpoints.cases.root,
        {
          title: payload.title,
          caseNumber: payload.caseNumber || null,
          description: payload.description || null,
          practiceArea: payload.practiceArea || null,
          status: payload.status || 'OPEN',
          priority: payload.priority || 'MEDIUM',
          clientId: payload.clientId || null,
          court: payload.court || null,
          judgeName: payload.judgeName || null,
          opposingParty: payload.opposingParty || null,
          opposingCounsel: payload.opposingCounsel || null,
          assignedToUserId: payload.leadLawyerId || null,
          memberUserIds: payload.teamMemberIds,
          filingDate: payload.milestones.filingDate || null,
          filingDeadline: payload.milestones.filingDeadline || null,
        },
      )
      return normalizeCaseDetails(data.data)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create case.'))
    }
  },

  async updateCase(id: string, payload: Partial<CasePayload>): Promise<CaseDetails> {
    try {
      const body: Record<string, unknown> = {}
      if (payload.title !== undefined) body.title = payload.title
      if (payload.caseNumber !== undefined) body.caseNumber = payload.caseNumber || null
      if (payload.description !== undefined) body.description = payload.description || null
      if (payload.practiceArea !== undefined) body.practiceArea = payload.practiceArea || null
      if (payload.status !== undefined) body.status = payload.status || undefined
      if (payload.priority !== undefined) body.priority = payload.priority || undefined
      if (payload.clientId !== undefined) body.clientId = payload.clientId || null
      if (payload.court !== undefined) body.court = payload.court || null
      if (payload.judgeName !== undefined) body.judgeName = payload.judgeName || null
      if (payload.opposingParty !== undefined) body.opposingParty = payload.opposingParty || null
      if (payload.opposingCounsel !== undefined) {
        body.opposingCounsel = payload.opposingCounsel || null
      }
      if (payload.leadLawyerId !== undefined) {
        body.assignedToUserId = payload.leadLawyerId || null
      }
      if (payload.teamMemberIds !== undefined) body.memberUserIds = payload.teamMemberIds
      if (payload.milestones) {
        body.filingDate = payload.milestones.filingDate || null
        body.filingDeadline = payload.milestones.filingDeadline || null
      }

      const { data } = await apiClient.patch<{ success: boolean; data: CaseDetails }>(
        endpoints.cases.byId(id),
        body,
      )
      return normalizeCaseDetails(data.data)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update case.'))
    }
  },

  async updateStatus(id: string, status: CaseStatus): Promise<CaseDetails> {
    try {
      const { data } = await apiClient.patch<{ success: boolean; data: CaseDetails }>(
        endpoints.cases.status(id),
        { status },
      )
      return normalizeCaseDetails(data.data)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update case status.'))
    }
  },

  async deleteCase(id: string): Promise<void> {
    try {
      await apiClient.delete(endpoints.cases.byId(id))
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to delete case.'))
    }
  },

  async deleteCases(ids: string[]): Promise<void> {
    try {
      await apiClient.delete(endpoints.cases.bulk, { data: { ids } })
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to delete cases.'))
    }
  },

  async getHearings(caseId: string, params: HearingListParams): Promise<HearingListResponse> {
    try {
      const { data } = await apiClient.get<HearingListResponse>(endpoints.hearings.root, {
        params: {
          caseId,
          status: params.status !== 'ALL' ? params.status : undefined,
          page: params.page,
          pageSize: params.pageSize,
        },
      })
      return data
    } catch {
      return { items: [], pagination: emptyPagination(params.page, params.pageSize) }
    }
  },

  async createHearing(_caseId: string, payload: HearingPayload): Promise<Hearing | null> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: Hearing }>(
        endpoints.hearings.root,
        payload,
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create hearing.'))
    }
  },

  async getAssignableLawyers(search?: string): Promise<CasePersonRef[]> {
    try {
      const { data } = await apiClient.get<{ success: boolean; items: CasePersonRef[] }>(
        endpoints.users.root,
        { params: { search: search || undefined, role: 'LAWYER', pageSize: 50 } },
      )
      return (data.items ?? []).map((m: any) => ({
        id: m.userId ?? m.id,
        fullName: m.user?.fullName ?? m.fullName ?? '',
        avatarUrl: m.user?.avatarUrl ?? m.avatarUrl ?? null,
        role: m.role ?? 'LAWYER',
      }))
    } catch {
      return []
    }
  },
}
