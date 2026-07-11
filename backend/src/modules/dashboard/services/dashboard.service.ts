import { AppError } from '../../../shared/errors/AppError';
import type { AuthContext } from '../../../shared/types/auth-context';
import type { DashboardCache } from '../cache/dashboard-cache';
import type { DashboardResponseDto } from '../dto';
import type { DashboardAggregator } from '../aggregation/dashboard-aggregator';
import type { DashboardMapper } from '../mapper/dashboard.mapper';
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

  async getDashboard(auth: AuthContext): Promise<DashboardResponseDto> {
    if (!auth.workspaceId) {
      throw new AppError(403, 'Workspace context is required.');
    }

    const cached = await this.cache.get(auth.workspaceId);
    if (cached) {
      return cached;
    }

    const now = new Date();
    const greeting = this.greetingService.build(
      auth.user.fullName,
      now,
      auth.workspaceTimezone,
    );
    const parts = await this.aggregator.aggregate(auth, greeting, now);
    const composed = this.aggregator.compose(auth, parts);
    const response = this.mapper.toResponse(composed);

    await this.cache.set(auth.workspaceId, response);

    return response;
  }
}
