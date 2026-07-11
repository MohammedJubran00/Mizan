import type { ChartsDto, OverviewDto } from '../dto';
import type { CaseStatisticsResult } from './case-statistics.service';
import type { CaseStatisticsService } from './case-statistics.service';
import type { RevenueStatisticsResult } from './revenue-statistics.service';
import type { RevenueStatisticsService } from './revenue-statistics.service';
import type { HearingStatisticsService } from './hearing-statistics.service';
import type { DeadlineStatisticsService } from './deadline-statistics.service';
import type { ActivityStatisticsService } from './activity-statistics.service';
import type { TeamStatisticsService } from './team-statistics.service';
import type { ActivitiesDto, DeadlinesDto, HearingsDto, TeamDto } from '../dto';

export interface DashboardStatisticsBundle {
  cases: CaseStatisticsResult;
  revenue: RevenueStatisticsResult;
  hearings: HearingsDto;
  deadlines: DeadlinesDto;
  activities: ActivitiesDto;
  team: TeamDto;
}

/**
 * Orchestrates independent statistic services in parallel for one workspace.
 */
export class DashboardStatisticsService {
  constructor(
    private readonly caseStatistics: CaseStatisticsService,
    private readonly revenueStatistics: RevenueStatisticsService,
    private readonly hearingStatistics: HearingStatisticsService,
    private readonly deadlineStatistics: DeadlineStatisticsService,
    private readonly activityStatistics: ActivityStatisticsService,
    private readonly teamStatistics: TeamStatisticsService,
  ) {}

  async calculateAll(workspaceId: string, now: Date = new Date()): Promise<DashboardStatisticsBundle> {
    const [cases, revenue, hearings, deadlines, activities, team] = await Promise.all([
      this.caseStatistics.calculate(workspaceId),
      this.revenueStatistics.calculate(workspaceId),
      this.hearingStatistics.calculate(workspaceId, now),
      this.deadlineStatistics.calculate(workspaceId, now),
      this.activityStatistics.calculate(workspaceId),
      this.teamStatistics.calculate(workspaceId),
    ]);

    return { cases, revenue, hearings, deadlines, activities, team };
  }

  toOverview(bundle: DashboardStatisticsBundle): OverviewDto {
    return {
      activeCases: bundle.cases.activeCases,
      revenue: bundle.revenue.card,
      winRate: bundle.cases.winRate,
      billableHours: bundle.cases.billableHours,
      clients: bundle.cases.clients,
    };
  }

  toCharts(bundle: DashboardStatisticsBundle): ChartsDto {
    return {
      casesByStatus: bundle.cases.caseMix.byStatus,
      revenueByMonth: bundle.revenue.breakdown.byMonth,
      caseMixByPracticeArea: bundle.cases.caseMix.byPracticeArea,
    };
  }
}
