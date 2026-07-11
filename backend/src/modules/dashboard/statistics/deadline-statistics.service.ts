import type { DeadlinesDto } from '../dto';
import type { DashboardDeadlineRepository } from '../repositories/dashboard-deadline.repository';

/**
 * Deadline statistics for one workspace.
 */
export class DeadlineStatisticsService {
  constructor(private readonly deadlineRepository: DashboardDeadlineRepository) {}

  async calculate(workspaceId: string, now: Date = new Date()): Promise<DeadlinesDto> {
    const [upcomingCount, overdueCount, items] = await Promise.all([
      this.deadlineRepository.countUpcomingDeadlines(workspaceId, now),
      this.deadlineRepository.countOverdueDeadlines(workspaceId, now),
      this.deadlineRepository.findUpcomingDeadlines(workspaceId, now, 10),
    ]);

    return {
      upcomingCount,
      overdueCount,
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        dueAt: item.dueAt.toISOString(),
        status: item.status,
        caseId: item.caseId,
      })),
    };
  }
}
