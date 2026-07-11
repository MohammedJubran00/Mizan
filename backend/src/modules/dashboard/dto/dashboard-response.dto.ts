import type { RevenueDashboardDto } from '../revenue/dto/revenue-analytics.dto';
import type {
  ActivitiesDashboardDto,
  DashboardAlertsDto,
  DeadlinesDashboardDto,
  HearingsDashboardDto,
  NotificationSummaryDto,
} from '../timeline/dto/timeline.dto';

/** Dynamic greeting derived from workspace timezone and the authenticated user. */
export interface GreetingDto {
  message: string;
  period: 'morning' | 'afternoon' | 'evening';
  firstName: string;
  serverTime: string;
  timezone: string;
}

export interface DashboardUserDto {
  id: string;
  fullName: string;
  email: string;
  firstName: string;
}

export interface DashboardWorkspaceDto {
  id: string;
  role: string;
  timezone: string;
}

export interface CaseOverviewStatsDto {
  total: number;
  active: number;
  closed: number;
  won: number;
  lost: number;
  pending: number;
  draft: number;
  open: number;
}

export interface ActiveCasesCardDto {
  /** COUNT where status = ACTIVE (workspace-scoped). */
  active: number;
  open: number;
  closed: number;
  total: number;
  pending: number;
  draft: number;
  won: number;
  lost: number;
  trendLabel: string;
}

export interface RevenuePeriodsDto {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  thisQuarter: number;
  lastQuarter: number;
  thisYear: number;
  lastYear: number;
  lifetime: number;
}

export interface RevenueGrowthDto {
  weekOverWeek: number;
  monthOverMonth: number;
  quarterOverQuarter: number;
  yearOverYear: number;
}

export interface RevenueCardDto {
  totalPaid: number;
  currency: string;
  invoiceCount: number;
  paidInvoiceCount: number;
  outstanding: number;
  fromInvoices: number;
  fromManual: number;
  trendLabel: string;
}

export interface WinRateCardDto {
  /** Won / Closed × 100 (closed = CLOSED + WON + LOST). */
  winRate: number;
  won: number;
  lost: number;
  closed: number;
  decided: number;
  trendLabel: string;
}

export interface BillableHoursPeriodsDto {
  today: number;
  week: number;
  month: number;
  year: number;
  lifetime: number;
}

export interface BillableHoursCardDto {
  totalHours: number;
  caseCount: number;
  averagePerCase: number;
  periods: BillableHoursPeriodsDto;
  trendLabel: string;
}

export interface ClientsCardDto {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  returning: number;
  trendLabel: string;
}

export interface OverviewDto {
  cases: CaseOverviewStatsDto;
  activeCases: ActiveCasesCardDto;
  revenue: RevenueCardDto;
  winRate: WinRateCardDto;
  billableHours: BillableHoursCardDto;
  clients: ClientsCardDto;
}

export interface RevenueMonthPointDto {
  month: string;
  amount: number;
}

export interface RevenueBreakdownDto {
  paid: number;
  outstanding: number;
  draft: number;
  currency: string;
  fromInvoices: number;
  fromManual: number;
  periods: RevenuePeriodsDto;
  growth: RevenueGrowthDto;
  byMonth: RevenueMonthPointDto[];
}

export type { RevenueDashboardDto } from '../revenue/dto/revenue-analytics.dto';
export type {
  ActivitiesDashboardDto,
  DashboardAlertsDto,
  DeadlinesDashboardDto,
  HearingsDashboardDto,
  NotificationSummaryDto,
} from '../timeline/dto/timeline.dto';

export interface HearingItemDto {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  location: string | null;
  caseId: string | null;
}

/** @deprecated Prefer HearingsDashboardDto from timeline engine. */
export interface HearingsDto {
  todayCount: number;
  upcomingCount: number;
  overdueCount: number;
  completedCount: number;
  cancelledCount: number;
  items: HearingItemDto[];
}

export interface DeadlineItemDto {
  id: string;
  title: string;
  dueAt: string;
  status: string;
  caseId: string | null;
}

export interface DeadlineWindowsDto {
  within24Hours: number;
  within3Days: number;
  within7Days: number;
  within30Days: number;
}

/** @deprecated Prefer DeadlinesDashboardDto from timeline engine. */
export interface DeadlinesDto {
  todayCount: number;
  upcomingCount: number;
  overdueCount: number;
  completedCount: number;
  windows: DeadlineWindowsDto;
  items: DeadlineItemDto[];
}

export interface ActivityActorDto {
  id: string;
  fullName: string;
  email: string;
}

export interface ActivityTargetDto {
  type: string;
  id: string;
}

export interface ActivityItemDto {
  id: string;
  type: string;
  action: string;
  title: string;
  description: string | null;
  actor: ActivityActorDto | null;
  target: ActivityTargetDto | null;
  workspaceId: string;
  timestamp: string;
  entityType: string | null;
  entityId: string | null;
  userId: string | null;
  createdAt: string;
}

/** @deprecated Prefer ActivitiesDashboardDto from timeline engine. */
export interface ActivitiesDto {
  total: number;
  items: ActivityItemDto[];
}

export interface ChartSeriesPointDto {
  label: string;
  value: number;
  percentage?: number;
}

export interface ChartsDto {
  casesByStatus: ChartSeriesPointDto[];
  revenueByMonth: RevenueMonthPointDto[];
  caseMixByPracticeArea: ChartSeriesPointDto[];
}

export interface TeamMemberDto {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface TeamRoleCountsDto {
  /** Dynamic map of role → count read from the database. */
  byRole: Record<string, number>;
  lawyers: number;
  assistants: number;
  admins: number;
  owners: number;
  members: number;
}

export interface TeamDto {
  totalUsers: number;
  activeUsers: number;
  roles: TeamRoleCountsDto;
  averageCasesPerLawyer: number;
  averageClosedCases: number;
  averageWinRate: number;
  memberCount: number;
  members: TeamMemberDto[];
}

export interface CaseMixSliceDto {
  label: string;
  value: number;
  percentage: number;
}

export interface CaseMixDto {
  byStatus: CaseMixSliceDto[];
  byPracticeArea: CaseMixSliceDto[];
}

/**
 * Aggregated dashboard payload for a single authenticated workspace.
 * Extensible: new widget sections can be appended without breaking clients.
 */
export interface DashboardResponseDto {
  success: true;
  generatedAt: string;
  greeting: GreetingDto;
  user: DashboardUserDto;
  workspace: DashboardWorkspaceDto;
  overview: OverviewDto;
  /** Full revenue analytics engine (Billing source of truth). */
  revenue: RevenueDashboardDto;
  hearings: HearingsDashboardDto;
  deadlines: DeadlinesDashboardDto;
  activities: ActivitiesDashboardDto;
  alerts: DashboardAlertsDto;
  notifications: NotificationSummaryDto;
  charts: ChartsDto;
  team: TeamDto;
  caseMix: CaseMixDto;
  /** Reserved for future widgets (AI insights, notifications, tasks, etc.). */
  extensions: Record<string, unknown>;
}
