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

/**
 * Placeholder data access layer for the cases module.
 *
 * The `/api/cases` endpoints do not exist yet, so every method resolves with an
 * empty result. Replace the bodies with `apiClient` calls once the API lands —
 * the signatures below are the contract the UI is built against.
 */
export const caseService = {
  async getCases(params: CaseListParams): Promise<CaseListResponse> {
    return {
      items: [],
      pagination: emptyPagination(params.page, params.pageSize),
    }
  },

  async getCaseStats(): Promise<CaseStatsSummary | null> {
    return null
  },

  async getCase(_id: string): Promise<CaseDetails | null> {
    return null
  },

  async createCase(_payload: CasePayload): Promise<CaseDetails | null> {
    return null
  },

  async updateCase(
    _id: string,
    _payload: Partial<CasePayload>,
  ): Promise<CaseDetails | null> {
    return null
  },

  async updateStatus(
    _id: string,
    _status: CaseStatus,
  ): Promise<CaseDetails | null> {
    return null
  },

  async deleteCase(_id: string): Promise<void> {
    return Promise.resolve()
  },

  async deleteCases(_ids: string[]): Promise<void> {
    return Promise.resolve()
  },

  async getHearings(
    _caseId: string,
    params: HearingListParams,
  ): Promise<HearingListResponse> {
    return {
      items: [],
      pagination: emptyPagination(params.page, params.pageSize),
    }
  },

  async createHearing(
    _caseId: string,
    _payload: HearingPayload,
  ): Promise<Hearing | null> {
    return null
  },

  /** Team members that can be assigned as lead counsel or collaborators. */
  async getAssignableLawyers(_search?: string): Promise<CasePersonRef[]> {
    return []
  },
}
