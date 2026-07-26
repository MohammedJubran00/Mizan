export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
  nextCursor: string | null
  prevCursor: string | null
}

export interface GreetingDto {
  message: string
  period: 'morning' | 'afternoon' | 'evening'
  firstName: string
  serverTime: string
  timezone: string
}

export interface DashboardUserDto {
  id: string
  fullName: string
  email: string
  firstName: string
}

export interface DashboardWorkspaceDto {
  id: string
  role: string
  timezone: string
}

export interface ChartSeriesPointDto {
  label: string
  value: number
  percentage?: number
}

export interface CaseMixSliceDto {
  label: string
  value: number
  percentage: number
}

export interface OverviewDto {
  cases: {
    total: number
    active: number
    closed: number
    won: number
    lost: number
    pending: number
    draft: number
    open: number
  }
  activeCases: {
    active: number
    open: number
    closed: number
    total: number
    pending: number
    draft: number
    won: number
    lost: number
    trendLabel: string
  }
  revenue: {
    totalPaid: number
    currency: string
    invoiceCount: number
    paidInvoiceCount: number
    outstanding: number
    fromInvoices: number
    fromManual: number
    trendLabel: string
  }
  winRate: {
    winRate: number
    won: number
    lost: number
    closed: number
    decided: number
    trendLabel: string
  }
  billableHours: {
    totalHours: number
    caseCount: number
    averagePerCase: number
    periods: {
      today: number
      week: number
      month: number
      year: number
      lifetime: number
    }
    trendLabel: string
  }
  clients: {
    total: number
    active: number
    inactive: number
    newThisMonth: number
    returning: number
    trendLabel: string
  }
}

export interface HearingDetailDto {
  id: string
  caseId: string | null
  caseNumber: string | null
  caseTitle: string | null
  clientName: string | null
  courtName: string | null
  location: string | null
  assignedLawyer: string | null
  hearingDate: string
  hearingTime: string
  scheduledAt: string
  hearingType: string
  status: string
  priority: PriorityLevel
  daysRemaining: number
  title: string
}

export interface HearingsDashboardDto {
  todayCount: number
  upcomingCount: number
  overdueCount: number
  completedCount: number
  cancelledCount: number
  summary: {
    today: number
    tomorrow: number
    upcoming: number
    completed: number
    cancelled: number
    rescheduled: number
    overdue: number
  }
  hearings: HearingDetailDto[]
  pagination: PaginationMeta
}

export interface DeadlineDetailDto {
  id: string
  caseId: string | null
  caseNumber: string | null
  caseTitle: string | null
  title: string
  type: string
  importance: string
  status: string
  dueAt: string
  dueDate: string
  dueTime: string
  priority: PriorityLevel
  daysRemaining: number
}

export interface DeadlinesDashboardDto {
  todayCount: number
  upcomingCount: number
  overdueCount: number
  completedCount: number
  windows: {
    within24Hours: number
    within3Days: number
    within7Days: number
    within30Days: number
  }
  summary: {
    dueToday: number
    dueTomorrow: number
    dueThisWeek: number
    dueThisMonth: number
    overdue: number
    completed: number
    cancelled: number
    upcoming: number
  }
  deadlines: DeadlineDetailDto[]
  pagination: PaginationMeta
}

export interface TimelineActivityDto {
  id: string
  workspaceId: string
  actor: {
    id: string
    fullName: string
    email: string
    avatarUrl: string | null
  } | null
  action: string
  type: string
  targetType: string | null
  targetId: string | null
  targetName: string | null
  title: string
  description: string | null
  icon: string
  color: string
  timestamp: string
  relativeTime: string
  severity: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface ActivityGroupDto {
  key: string
  label: string
  items: TimelineActivityDto[]
}

export interface ActivitiesDashboardDto {
  total: number
  items: TimelineActivityDto[]
  groups: ActivityGroupDto[]
  pagination: PaginationMeta
}

export interface NotificationSummaryDto {
  unreadNotifications: number
  criticalNotifications: number
  upcomingHearings: number
  urgentDeadlines: number
  pendingTasks: number
  unreadMessages: number
}

export interface ChartsDto {
  casesByStatus: ChartSeriesPointDto[]
  revenueByMonth: Array<{ month: string; amount: number }>
  caseMixByPracticeArea: ChartSeriesPointDto[]
}

export interface TeamDto {
  totalUsers: number
  activeUsers: number
  roles: {
    byRole: Record<string, number>
    lawyers: number
    assistants: number
    admins: number
    owners: number
    members: number
  }
  averageCasesPerLawyer: number
  averageClosedCases: number
  averageWinRate: number
  memberCount: number
  members: Array<{
    userId: string
    fullName: string
    email: string
    role: string
    isActive: boolean
  }>
}

export interface CaseMixDto {
  byStatus: CaseMixSliceDto[]
  byPracticeArea: CaseMixSliceDto[]
}

export interface RevenueDashboardDto {
  paid: number
  outstanding: number
  draft: number
  currency: string
  fromInvoices: number
  fromManual: number
  periods: {
    today: number
    yesterday: number
    thisWeek: number
    lastWeek: number
    thisMonth: number
    lastMonth: number
    thisQuarter: number
    lastQuarter: number
    thisYear: number
    lastYear: number
    lifetime: number
  }
  growth: {
    weekOverWeek: number
    monthOverMonth: number
    quarterOverQuarter: number
    yearOverYear: number
  }
  byMonth: Array<{ month: string; amount: number }>
  comparisons?: {
    weekOverWeek: { percentage: number; direction: string }
    monthOverMonth: { percentage: number; direction: string }
    quarterOverQuarter: { percentage: number; direction: string }
    yearOverYear: { percentage: number; direction: string }
  }
  breakdown?: {
    items: Array<{
      key: string
      label: string
      amount: number
      percentage: number
      currency: string
    }>
    total: number
    currency: string
  }
}

export interface DashboardResponse {
  success: true
  generatedAt: string
  greeting: GreetingDto
  user: DashboardUserDto
  workspace: DashboardWorkspaceDto
  overview: OverviewDto
  revenue: RevenueDashboardDto
  hearings: HearingsDashboardDto
  deadlines: DeadlinesDashboardDto
  activities: ActivitiesDashboardDto
  notifications: NotificationSummaryDto
  charts: ChartsDto
  team: TeamDto
  caseMix: CaseMixDto
  extensions: Record<string, unknown>
}
