import type { ActivitiesDto } from '../dto';
import type { DashboardActivityRepository } from '../repositories/dashboard-activity.repository';

/**
 * Recent activity feed statistics for one workspace.
 */
export class ActivityStatisticsService {
  constructor(private readonly activityRepository: DashboardActivityRepository) {}

  async calculate(workspaceId: string): Promise<ActivitiesDto> {
    const [total, items] = await Promise.all([
      this.activityRepository.countActivities(workspaceId),
      this.activityRepository.findRecentActivities(workspaceId, 15),
    ]);

    return {
      total,
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        entityType: item.entityType,
        entityId: item.entityId,
        userId: item.userId,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }
}
