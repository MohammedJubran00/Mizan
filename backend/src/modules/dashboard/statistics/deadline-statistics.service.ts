import type { WorkspacePeriods } from '../../../shared/utils/timezone';
import type { DeadlinesDto } from '../dto';
import type { DashboardDeadlineRepository } from '../repositories/dashboard-deadline.repository';

/**
 * Deadline statistics with rolling windows, timezone-aware.
 */
export class DeadlineStatisticsService {
  constructor(private readonly deadlineRepository: DashboardDeadlineRepository) {}

  async calculate(
    workspaceId: string,
    now: Date,
    periods: WorkspacePeriods,
  ): Promise<DeadlinesDto> {
    const [
      todayCount,
      upcomingCount,
      overdueCount,
      completedCount,
      within24Hours,
      within3Days,
      within7Days,
      within30Days,
      items,
    ] = await Promise.all([
      this.deadlineRepository.countInPeriod(workspaceId, periods.today),
      this.deadlineRepository.countUpcoming(workspaceId, now),
      this.deadlineRepository.countOverdue(workspaceId, now),
      this.deadlineRepository.countCompleted(workspaceId),
      this.deadlineRepository.countInPeriod(workspaceId, periods.next24Hours),
      this.deadlineRepository.countInPeriod(workspaceId, periods.next3Days),
      this.deadlineRepository.countInPeriod(workspaceId, periods.next7Days),
      this.deadlineRepository.countInPeriod(workspaceId, periods.next30Days),
      this.deadlineRepository.findNearestUpcoming(workspaceId, now, 10),
    ]);

    return {
      todayCount,
      upcomingCount,
      overdueCount,
      completedCount,
      windows: {
        within24Hours,
        within3Days,
        within7Days,
        within30Days,
      },
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
