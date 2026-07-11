import { createHash } from 'crypto';

import { AppError } from '../../../shared/errors/AppError';
import { createLogger } from '../../../shared/observability/logger';
import type { AuthContext } from '../../../shared/types/auth-context';
import {
  buildDashboardCacheKey,
  DASHBOARD_CACHE_TTL_SECONDS,
  type DashboardCache,
} from '../cache/dashboard-cache';
import type { DashboardResponseDto } from '../dto';
import type { DashboardAggregator } from '../aggregation/dashboard-aggregator';
import type { DashboardMapper } from '../mapper/dashboard.mapper';
import type { RevenueFilterInput } from '../revenue/filters/revenue-filter';
import type { TimelineFilterInput } from '../timeline/filters/timeline-filter';
import type { GreetingService } from '../statistics/greeting.service';

const log = createLogger('dashboard-service');

/**
 * Application service for the dashboard aggregation API.
 * Uses Smart Cache with request deduplication and workspace isolation.
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

    const workspaceId = auth.workspaceId;
    const filterDigest = digestFilters(revenueFilter, timelineFilter);
    const cacheKey = buildDashboardCacheKey(workspaceId, filterDigest);

    return log.timed(
      'dashboard_aggregate',
      { workspaceId, cacheKey, filterDigest: filterDigest ?? 'default' },
      () =>
        this.cache.getOrLoad(
          cacheKey,
          workspaceId,
          () => this.loadFresh(auth, revenueFilter, timelineFilter),
          DASHBOARD_CACHE_TTL_SECONDS,
        ),
    );
  }

  private async loadFresh(
    auth: AuthContext,
    revenueFilter: RevenueFilterInput,
    timelineFilter?: TimelineFilterInput,
  ): Promise<DashboardResponseDto> {
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
    return this.mapper.toResponse(composed);
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
