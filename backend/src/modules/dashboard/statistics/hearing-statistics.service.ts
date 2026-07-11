import type { WorkspacePeriods } from '../../../shared/utils/timezone';
import type { HearingsDto } from '../dto';
import type { DashboardHearingRepository } from '../repositories/dashboard-hearing.repository';

/**
 * Hearing statistics ordered by nearest date, timezone-aware.
 */
export class HearingStatisticsService {
  constructor(private readonly hearingRepository: DashboardHearingRepository) {}

  async calculate(
    workspaceId: string,
    now: Date,
    periods: WorkspacePeriods,
  ): Promise<HearingsDto> {
    const [todayCount, upcomingCount, overdueCount, completedCount, cancelledCount, items] =
      await Promise.all([
        this.hearingRepository.countInPeriod(workspaceId, periods.today, ['SCHEDULED']),
        this.hearingRepository.countUpcoming(workspaceId, now),
        this.hearingRepository.countOverdue(workspaceId, now),
        this.hearingRepository.countByStatus(workspaceId, 'COMPLETED'),
        this.hearingRepository.countByStatus(workspaceId, 'CANCELLED'),
        this.hearingRepository.findNearestUpcoming(workspaceId, now, 10),
      ]);

    return {
      todayCount,
      upcomingCount,
      overdueCount,
      completedCount,
      cancelledCount,
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        scheduledAt: item.scheduledAt.toISOString(),
        status: item.status,
        location: item.location,
        caseId: item.caseId,
      })),
    };
  }
}
