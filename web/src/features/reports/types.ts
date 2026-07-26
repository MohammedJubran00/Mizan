export const REPORT_CATEGORIES = [
  'FINANCIAL',
  'OPERATIONS',
  'COMPLIANCE',
  'PRODUCTIVITY',
  'CUSTOM',
] as const

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]

export const REPORT_TYPES = [
  'REVENUE',
  'CASES',
  'CLIENTS',
  'HEARINGS',
  'DOCUMENTS',
  'BILLABLE_HOURS',
  'CUSTOM',
] as const

export type ReportType = (typeof REPORT_TYPES)[number]

export const REPORT_STATUSES = ['DRAFT', 'READY', 'SCHEDULED', 'ARCHIVED'] as const

export type ReportStatus = (typeof REPORT_STATUSES)[number]

export const EXPORT_FORMATS = ['PDF', 'CSV', 'XLS'] as const

export type ExportFormat = (typeof EXPORT_FORMATS)[number]

export const DATA_SOURCES = [
  'INVOICES',
  'CASE_HOURS',
  'EXPENSES',
  'CLIENTS',
  'CASES',
  'HEARINGS',
  'DOCUMENTS',
] as const

export type DataSource = (typeof DATA_SOURCES)[number]

export const GROUP_BY_OPTIONS = [
  'NONE',
  'PRACTICE_AREA',
  'LAWYER',
  'CLIENT',
  'CASE',
  'MONTH',
  'STATUS',
] as const

export type GroupByOption = (typeof GROUP_BY_OPTIONS)[number]

export const SORT_BY_OPTIONS = [
  'AMOUNT',
  'DATE',
  'NAME',
  'STATUS',
  'COUNT',
] as const

export type SortByOption = (typeof SORT_BY_OPTIONS)[number]

export const SCHEDULE_FREQUENCIES = [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY',
] as const

export type ScheduleFrequency = (typeof SCHEDULE_FREQUENCIES)[number]

export interface ChartPoint {
  label: string
  value: number
  secondary?: number
}

export interface ChartSeries {
  key: string
  label: string
  points: ChartPoint[]
}

export interface NamedAmount {
  label: string
  amount: number
  percentage?: number
  currency?: string
}

export interface TrendValue {
  value: number
  /** Percentage change vs comparison period; null when unavailable. */
  changePercent: number | null
  sparkline: number[]
}

export interface ReportsDashboardKpis {
  totalClients: TrendValue
  activeCases: TrendValue
  closedCases: TrendValue
  upcomingHearings: TrendValue
  totalRevenue: TrendValue & { currency: string }
  outstandingBalance: TrendValue & { currency: string }
  documentsUploaded: TrendValue
  averageResolutionDays: TrendValue
}

export interface ReportsDashboard {
  kpis: ReportsDashboardKpis | null
  monthlyRevenue: ChartPoint[]
  practiceAreaRevenue: NamedAmount[]
  revenueTrend: ChartPoint[]
  caseDistribution: NamedAmount[]
  lawyerPerformance: Array<{
    id: string
    name: string
    billableHours: number
    revenue: number
    openCases: number
  }>
  topClients: Array<{
    id: string
    name: string
    revenue: number
    cases: number
  }>
  upcomingHearings: Array<{
    id: string
    title: string
    scheduledAt: string
    caseTitle?: string | null
  }>
  currency: string
  lastSyncedAt?: string | null
}

export interface ReportFilter {
  startDate?: string
  endDate?: string
  compareStartDate?: string
  compareEndDate?: string
  practiceArea?: string
  lawyerId?: string
  clientId?: string
  caseId?: string
  dataSources: DataSource[]
  groupBy: GroupByOption
  sortBy: SortByOption
  sortDir: 'asc' | 'desc'
  search?: string
  category?: ReportCategory | 'ALL'
}

export interface ReportListItem {
  id: string
  name: string
  category: ReportCategory
  type: ReportType
  status: ReportStatus
  createdBy: string
  createdAt: string
  lastRunAt?: string | null
  formats: ExportFormat[]
}

export interface ReportPreviewRow {
  id: string
  refId: string
  clientName: string
  status: string
  branch: string
  amount: number
  currency: string
}

export interface Report {
  id: string
  name: string
  type: ReportType
  category: ReportCategory
  status: ReportStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  lastRunAt?: string | null
  formats: ExportFormat[]
  filters: ReportFilter
  summary?: string | null
  statistics: NamedAmount[]
  charts: {
    revenueTrend: ChartPoint[]
    caseDistribution: NamedAmount[]
    practiceArea: NamedAmount[]
  }
  rows: ReportPreviewRow[]
  metadata: Record<string, string>
}

export interface ReportPayload {
  name: string
  type: ReportType
  category: ReportCategory
  filters: ReportFilter
  formats: ExportFormat[]
}

export interface ReportListResponse {
  items: ReportListItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface LibrarySummary {
  monthlyIncreasePercent: number | null
  averageProcessingSeconds: number | null
  sharedWithPartners: number | null
}

export interface PracticeInsights {
  billableHoursTrend: ChartPoint[]
  totalRevenue: number | null
  activeCases: number | null
  currency: string
  practiceAreaGrowth: NamedAmount[]
  caseResolution: ChartPoint[]
  clientGrowth: ChartPoint[]
  periodLabel?: string | null
}

export interface ScheduledReport {
  id: string
  reportId: string
  frequency: ScheduleFrequency
  recipients: string[]
  format: ExportFormat
  deliveryTime: string
  enabled: boolean
}

export interface ScheduleReportPayload {
  frequency: ScheduleFrequency
  recipients: string
  format: ExportFormat
  deliveryTime: string
}

export interface ExportOptions {
  format: ExportFormat
  includeCharts?: boolean
}

export interface AnalyticsQuery {
  startDate?: string
  endDate?: string
  lawyerId?: string
  practiceArea?: string
}
