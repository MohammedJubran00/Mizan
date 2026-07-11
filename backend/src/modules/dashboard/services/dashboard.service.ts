import { createHash } from 'crypto';

import { AppError } from '../../../shared/errors/AppError';
import type { AuthContext } from '../../../shared/types/auth-context';
import {
  buildDashboardCacheKey,
  type DashboardCache,
} from '../cache/dashboard-cache';
import type { DashboardResponseDto } from '../dto';
import type { DashboardAggregator } from '../aggregation/dashboard-aggregator';
import type { DashboardMapper } from '../mapper/dashboard.mapper';
import type { RevenueFilterInput } from '../revenue/filters/revenue-filter';
import type { TimelineFilterInput } from '../timeline/filters/timeline-filter';
import type { GreetingService } from '../statistics/greeting.service';

/**
 * Application service for the dashboard aggregation API.
 */
export class DashboardService {
  constructor(
    private readonly greetingService: GreetingService,
    private readonly aggregator: DashboardAggregator,
    private readonly mapper: DashboardMapper,
    private readonly cache: DashboardCache,
  ) {}

  async getDashboard(
    auth: AuthContext,
    revenueFilter: RevenueFilterInput = { topLimit: 5 },
    timelineFilter?: TimelineFilterInput,
  ): Promise<DashboardResponseDto> {
    if (!auth.workspaceId) {
      throw new AppError(403, 'Workspace context is required.');
    }

    const filterDigest = digestFilters(revenueFilter, timelineFilter);
    const cacheKey = buildDashboardCacheKey(auth.workspaceId, filterDigest);

    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();
    const greeting = this.greetingService.build(
      auth.user.fullName,
      now,
      auth.workspaceTimezone,
    );
    const parts = await this.aggregator.aggregate(
      auth,
      greeting,
      now,
      revenueFilter,
      timelineFilter,
    );
    const composed = this.aggregator.compose(auth, parts);
    const response = this.mapper.toResponse(composed);

    await this.cache.set(cacheKey, response);

    return response;
  }
}

function digestFilters(
  revenueFilter: RevenueFilterInput,
  timelineFilter?: TimelineFilterInput,
): string | undefined {
  const payload = {
    revenue: revenueFilter,
    timeline: timelineFilter ?? null,
  };

  const serialized = JSON.stringify(payload);
  if (serialized === JSON.stringify({ revenue: { topLimit: 5 }, timeline: null })) {
    return undefined;
  }

  return createHash('sha1').update(serialized).digest('hex').slice(0, 12);
}
