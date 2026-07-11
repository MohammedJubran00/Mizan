import type { AuthContext } from '../../../shared/types/auth-context';
import type { DashboardResponseDto, GreetingDto } from '../dto';
import type { RevenueFilterInput } from '../revenue/filters/revenue-filter';
import type { TimelineFilterInput } from '../timeline/filters/timeline-filter';
import type { DashboardStatisticsBundle } from '../statistics/dashboard-statistics.service';
import type { DashboardStatisticsService } from '../statistics/dashboard-statistics.service';

export interface AggregatedDashboardParts {
  greeting: GreetingDto;
  statistics: DashboardStatisticsBundle;
  generatedAt: Date;
  timezone: string;
}

/**
 * Aggregation layer between raw statistics and the response mapper.
 */
export class DashboardAggregator {
  constructor(private readonly statisticsService: DashboardStatisticsService) {}

  async aggregate(
    auth: AuthContext,
    greeting: GreetingDto,
    now: Date = new Date(),
    revenueFilter?: RevenueFilterInput,
    timelineFilter?: TimelineFilterInput,
  ): Promise<AggregatedDashboardParts> {
    const statistics = await this.statisticsService.calculateAll({
      workspaceId: auth.workspaceId,
      timezone: auth.workspaceTimezone,
      now,
      revenueFilter,
      timelineFilter,
    });

    return {
      greeting,
      statistics,
      generatedAt: now,
      timezone: auth.workspaceTimezone,
    };
  }

  compose(
    auth: AuthContext,
    parts: AggregatedDashboardParts,
  ): Omit<DashboardResponseDto, 'success'> {
    const { statistics, greeting, generatedAt, timezone } = parts;
    const firstName = greeting.firstName;

    return {
      generatedAt: generatedAt.toISOString(),
      greeting,
      user: {
        id: auth.user.id,
        fullName: auth.user.fullName,
        email: auth.user.email,
        firstName,
      },
      workspace: {
        id: auth.workspaceId,
        role: auth.workspaceRole,
        timezone,
      },
      overview: this.statisticsService.toOverview(statistics),
      revenue: statistics.revenue.analytics,
      hearings: statistics.hearings,
      deadlines: statistics.deadlines,
      activities: statistics.activities,
      alerts: statistics.alerts,
      notifications: statistics.notifications,
      charts: this.statisticsService.toCharts(statistics),
      team: statistics.team,
      caseMix: statistics.cases.caseMix,
      extensions: {},
    };
  }
}
