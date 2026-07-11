import type { AuthContext } from '../../../shared/types/auth-context';
import type { DashboardResponseDto } from '../dto';
import type { GreetingDto } from '../dto';
import type { DashboardStatisticsBundle } from '../statistics/dashboard-statistics.service';
import type { DashboardStatisticsService } from '../statistics/dashboard-statistics.service';

export interface AggregatedDashboardParts {
  greeting: GreetingDto;
  statistics: DashboardStatisticsBundle;
  generatedAt: Date;
}

/**
 * Aggregation layer between raw statistics and the response mapper.
 * Ready for future analytics / monthly reports without reshaping services.
 */
export class DashboardAggregator {
  constructor(private readonly statisticsService: DashboardStatisticsService) {}

  async aggregate(
    workspaceId: string,
    greeting: GreetingDto,
    now: Date = new Date(),
  ): Promise<AggregatedDashboardParts> {
    const statistics = await this.statisticsService.calculateAll(workspaceId, now);

    return {
      greeting,
      statistics,
      generatedAt: now,
    };
  }

  compose(
    auth: AuthContext,
    parts: AggregatedDashboardParts,
  ): Omit<DashboardResponseDto, 'success'> {
    const { statistics, greeting, generatedAt } = parts;
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
      },
      overview: this.statisticsService.toOverview(statistics),
      revenue: statistics.revenue.breakdown,
      hearings: statistics.hearings,
      deadlines: statistics.deadlines,
      activities: statistics.activities,
      charts: this.statisticsService.toCharts(statistics),
      team: statistics.team,
      caseMix: statistics.cases.caseMix,
      extensions: {},
    };
  }
}
