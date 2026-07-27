import type {
  AnalyticsQuery,
  ExportFormat,
  ExportOptions,
  LibrarySummary,
  PracticeInsights,
  Report,
  ReportCategory,
  ReportFilter,
  ReportListItem,
  ReportListResponse,
  ReportPayload,
  ReportPreviewRow,
  ReportsDashboard,
  ScheduleReportPayload,
  ScheduledReport,
} from '../types'

export interface ReportListParams {
  search?: string
  category: ReportCategory | 'ALL'
  sortBy: 'name' | 'createdAt' | 'lastRunAt'
  sortDir: 'asc' | 'desc'
  page: number
  pageSize: number
}

export interface DashboardQuery {
  startDate?: string
  endDate?: string
  compare?: boolean
}

function emptyPagination(page: number, pageSize: number) {
  return { page, pageSize, total: 0, totalPages: 0, hasMore: false }
}

/**
 * TODO: No Report model in Prisma — reports CRUD/analytics are unimplemented.
 * Returns empty results so the Reports UI shows an empty state (not fake data).
 *
 * Every method resolves empty until `/api/reports` exists. Signatures are the
 * UI contract — swap bodies for `apiClient` + `endpoints.reports` later.
 */
export const reportsService = {
  async getDashboard(_query: DashboardQuery = {}): Promise<ReportsDashboard | null> {
    return null
  },

  async getReports(params: ReportListParams): Promise<ReportListResponse> {
    return {
      items: [],
      pagination: emptyPagination(params.page, params.pageSize),
    }
  },

  async getLibrarySummary(): Promise<LibrarySummary | null> {
    return null
  },

  async getReport(_id: string): Promise<Report | null> {
    return null
  },

  async generateReport(_payload: ReportPayload): Promise<Report | null> {
    return null
  },

  async updateReport(
    _id: string,
    _payload: Partial<ReportPayload>,
  ): Promise<Report | null> {
    return null
  },

  async previewReport(
    _payload: ReportPayload,
  ): Promise<ReportPreviewRow[]> {
    return []
  },

  async deleteReport(_id: string): Promise<void> {
    return Promise.resolve()
  },

  async duplicateReport(_id: string): Promise<Report | null> {
    return null
  },

  async renameReport(_id: string, _name: string): Promise<Report | null> {
    return null
  },

  async runReport(_id: string): Promise<Report | null> {
    return null
  },

  async exportPdf(_id: string, _options?: ExportOptions): Promise<Blob | null> {
    return null
  },

  async exportExcel(_id: string): Promise<Blob | null> {
    return null
  },

  async exportCsv(_id: string): Promise<Blob | null> {
    return null
  },

  async scheduleReport(
    _reportId: string,
    _payload: ScheduleReportPayload,
  ): Promise<ScheduledReport | null> {
    return null
  },

  async getAnalytics(_query: AnalyticsQuery = {}): Promise<PracticeInsights | null> {
    return null
  },

  async shareReport(
    _id: string,
    _recipients: string[],
  ): Promise<void> {
    return Promise.resolve()
  },
}

export type { ReportFilter, ExportFormat, ReportListItem }
