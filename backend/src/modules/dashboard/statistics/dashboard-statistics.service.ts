import {
  normalizeTimezone,
  resolveWorkspacePeriods,
} from '../../../shared/utils/timezone';
import type {
  ActivitiesDto,
  ChartsDto,
  ClientsCardDto,
  DeadlinesDto,
  HearingsDto,
  OverviewDto,
  TeamDto,
} from '../dto';
import type { RevenueFilterInput } from '../revenue/filters/revenue-filter';
import type { CaseStatisticsResult } from './case-statistics.service';
import type { CaseStatisticsService } from './case-statistics.service';
import type { ClientStatisticsService } from './client-statistics.service';
import type { RevenueStatisticsResult } from './revenue-statistics.service';
import type { RevenueStatisticsService } from './revenue-statistics.service';
import type { HearingStatisticsService } from './hearing-statistics.service';
import type { DeadlineStatisticsService } from './deadline-statistics.service';
import type { ActivityStatisticsService } from './activity-statistics.service';
import type { TeamStatisticsService } from './team-statistics.service';

export interface DashboardStatisticsBundle {
  cases: CaseStatisticsResult;
  clients: ClientsCardDto;
  revenue: RevenueStatisticsResult;
  hearings: HearingsDto;
  deadlines: DeadlinesDto;
  activities: ActivitiesDto;
  team: TeamDto;
}

export interface DashboardStatisticsContext {
  workspaceId: string;
  timezone: string;
  now?: Date;
  revenueFilter?: RevenueFilterInput;
}

/**
 * Orchestrates independent statistic services in parallel for one workspace.
 * All period calculations use the workspace timezone.
 */
export class DashboardStatisticsService {
  constructor(
    private readonly caseStatistics: CaseStatisticsService,
    private readonly clientStatistics: ClientStatisticsService,
    private readonly revenueStatistics: RevenueStatisticsService,
    private readonly hearingStatistics: HearingStatisticsService,
    private readonly deadlineStatistics: DeadlineStatisticsService,
    private readonly activityStatistics: ActivityStatisticsService,
    private readonly teamStatistics: TeamStatisticsService,
  ) {}

  async calculateAll(
    context: DashboardStatisticsContext,
  ): Promise<DashboardStatisticsBundle> {
    const now = context.now ?? new Date();
    const timezone = normalizeTimezone(context.timezone);
    const periods = resolveWorkspacePeriods(now, timezone);
    const revenueFilter = context.revenueFilter ?? { topLimit: 5 };

    const [cases, clients, revenue, hearings, deadlines, activities, team] =
      await Promise.all([
        this.caseStatistics.calculate(context.workspaceId, periods),
        this.clientStatistics.calculate(context.workspaceId, periods),
        this.revenueStatistics.calculate(
          context.workspaceId,
          periods,
          revenueFilter,
          timezone,
        ),
        this.hearingStatistics.calculate(context.workspaceId, now, periods),
        this.deadlineStatistics.calculate(context.workspaceId, now, periods),
        this.activityStatistics.calculate(context.workspaceId),
        this.teamStatistics.calculate(context.workspaceId),
      ]);

    return { cases, clients, revenue, hearings, deadlines, activities, team };
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
