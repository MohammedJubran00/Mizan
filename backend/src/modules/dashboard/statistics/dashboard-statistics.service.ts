import {
  normalizeTimezone,
  resolveWorkspacePeriods,
} from '../../../shared/utils/timezone';
import type {
  ChartsDto,
  ClientsCardDto,
  OverviewDto,
  TeamDto,
} from '../dto';
import type { RevenueFilterInput } from '../revenue/filters/revenue-filter';
import type {
  ActivitiesDashboardDto,
  DashboardAlertsDto,
  DeadlinesDashboardDto,
  HearingsDashboardDto,
  NotificationSummaryDto,
} from '../timeline/dto/timeline.dto';
import type { TimelineFilterInput } from '../timeline/filters/timeline-filter';
import type { TimelineOrchestratorService } from '../timeline/services/timeline-orchestrator.service';
import type { CaseStatisticsResult } from './case-statistics.service';
import type { CaseStatisticsService } from './case-statistics.service';
import type { ClientStatisticsService } from './client-statistics.service';
import type { RevenueStatisticsResult } from './revenue-statistics.service';
import type { RevenueStatisticsService } from './revenue-statistics.service';
import type { TeamStatisticsService } from './team-statistics.service';

export interface DashboardStatisticsBundle {
  cases: CaseStatisticsResult;
  clients: ClientsCardDto;
  revenue: RevenueStatisticsResult;
  hearings: HearingsDashboardDto;
  deadlines: DeadlinesDashboardDto;
  activities: ActivitiesDashboardDto;
  alerts: DashboardAlertsDto;
  notifications: NotificationSummaryDto;
  team: TeamDto;
}

export interface DashboardStatisticsContext {
  workspaceId: string;
  timezone: string;
  now?: Date;
  revenueFilter?: RevenueFilterInput;
  timelineFilter?: TimelineFilterInput;
}

/**
 * Orchestrates independent statistic + timeline services in parallel.
 */
export class DashboardStatisticsService {
  constructor(
    private readonly caseStatistics: CaseStatisticsService,
    private readonly clientStatistics: ClientStatisticsService,
    private readonly revenueStatistics: RevenueStatisticsService,
    private readonly timelineOrchestrator: TimelineOrchestratorService,
    private readonly teamStatistics: TeamStatisticsService,
  ) {}

  async calculateAll(
    context: DashboardStatisticsContext,
  ): Promise<DashboardStatisticsBundle> {
    const now = context.now ?? new Date();
    const timezone = normalizeTimezone(context.timezone);
    const periods = resolveWorkspacePeriods(now, timezone);
    const revenueFilter = context.revenueFilter ?? { topLimit: 5 };
    const timelineFilter = context.timelineFilter ?? {
      hearingRange: 'NEXT_30_DAYS' as const,
      hearingPage: 1,
      hearingPageSize: 10,
      deadlinePage: 1,
      deadlinePageSize: 10,
      activityPage: 1,
      activityPageSize: 20,
    };

    const [cases, clients, revenue, timeline, team] = await Promise.all([
      this.caseStatistics.calculate(context.workspaceId, periods),
      this.clientStatistics.calculate(context.workspaceId, periods),
      this.revenueStatistics.calculate(
        context.workspaceId,
        periods,
        revenueFilter,
        timezone,
      ),
      this.timelineOrchestrator.calculateAll({
        workspaceId: context.workspaceId,
        timezone,
        now,
        periods,
        filter: timelineFilter,
      }),
      this.teamStatistics.calculate(context.workspaceId),
    ]);

    return {
      cases,
      clients,
      revenue,
      hearings: timeline.hearings,
      deadlines: timeline.deadlines,
      activities: timeline.activities,
      alerts: timeline.alerts,
      notifications: timeline.notifications,
      team,
    };
  }

  toOverview(bundle: DashboardStatisticsBundle): OverviewDto {
    return {
      cases: bundle.cases.overview,
      activeCases: bundle.cases.activeCases,
      revenue: bundle.revenue.card,
      winRate: bundle.cases.winRate,
      billableHours: bundle.cases.billableHours,
      clients: bundle.clients,
    };
  }

  toCharts(bundle: DashboardStatisticsBundle): ChartsDto {
    return {
      casesByStatus: bundle.cases.caseMix.byStatus,
      revenueByMonth: bundle.revenue.analytics.byMonth,
      caseMixByPracticeArea: bundle.cases.caseMix.byPracticeArea,
    };
  }
}
