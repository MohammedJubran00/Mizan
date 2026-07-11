/** Dynamic greeting derived from server time and the authenticated user. */
export interface GreetingDto {
  message: string;
  period: 'morning' | 'afternoon' | 'evening';
  firstName: string;
  serverTime: string;
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
}

export interface ActiveCasesCardDto {
  active: number;
  open: number;
  closed: number;
  total: number;
  trendLabel: string;
}

export interface RevenueCardDto {
  totalPaid: number;
  currency: string;
  invoiceCount: number;
  paidInvoiceCount: number;
  outstanding: number;
  trendLabel: string;
}

export interface WinRateCardDto {
  winRate: number;
  won: number;
  lost: number;
  decided: number;
  trendLabel: string;
}

export interface BillableHoursCardDto {
  totalHours: number;
  caseCount: number;
  averagePerCase: number;
  trendLabel: string;
}

export interface ClientsCardDto {
  total: number;
  trendLabel: string;
}

export interface OverviewDto {
  activeCases: ActiveCasesCardDto;
  revenue: RevenueCardDto;
  winRate: WinRateCardDto;
  billableHours: BillableHoursCardDto;
  clients: ClientsCardDto;
}

export interface RevenueBreakdownDto {
  paid: number;
  outstanding: number;
  draft: number;
  currency: string;
  byMonth: RevenueMonthPointDto[];
}

export interface RevenueMonthPointDto {
  month: string;
  amount: number;
}

export interface HearingItemDto {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  location: string | null;
  caseId: string | null;
}

export interface HearingsDto {
  upcomingCount: number;
  items: HearingItemDto[];
}

export interface DeadlineItemDto {
  id: string;
  title: string;
  dueAt: string;
  status: string;
  caseId: string | null;
}

export interface DeadlinesDto {
  upcomingCount: number;
  overdueCount: number;
  items: DeadlineItemDto[];
}

export interface ActivityItemDto {
  id: string;
  type: string;
  title: string;
  description: string | null;
  entityType: string | null;
  entityId: string | null;
  userId: string | null;
  createdAt: string;
}

export interface ActivitiesDto {
  total: number;
  items: ActivityItemDto[];
}

export interface ChartSeriesPointDto {
  label: string;
  value: number;
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
}

export interface TeamDto {
  memberCount: number;
  members: TeamMemberDto[];
}

export interface CaseMixDto {
  byStatus: ChartSeriesPointDto[];
  byPracticeArea: ChartSeriesPointDto[];
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
  revenue: RevenueBreakdownDto;
  hearings: HearingsDto;
  deadlines: DeadlinesDto;
  activities: ActivitiesDto;
  charts: ChartsDto;
  team: TeamDto;
  caseMix: CaseMixDto;
  /** Reserved for future widgets (AI insights, notifications, tasks, etc.). */
  extensions: Record<string, unknown>;
}
