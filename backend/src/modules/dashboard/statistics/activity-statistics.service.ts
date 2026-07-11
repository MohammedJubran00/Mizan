import type { ActivitiesDto } from '../dto';
import type { ActivityEngineService } from './activity-engine.service';

/**
 * Dashboard-facing activity statistics — delegates to the reusable Activity Engine.
 */
export class ActivityStatisticsService {
  constructor(private readonly activityEngine: ActivityEngineService) {}

  async calculate(workspaceId: string): Promise<ActivitiesDto> {
    return this.activityEngine.calculateRecent(workspaceId);
  }
}
