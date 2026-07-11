import type { HearingsDto } from '../dto';
import type { DashboardHearingRepository } from '../repositories/dashboard-hearing.repository';

/**
 * Upcoming hearing statistics for one workspace.
 */
export class HearingStatisticsService {
  constructor(private readonly hearingRepository: DashboardHearingRepository) {}

  async calculate(workspaceId: string, now: Date = new Date()): Promise<HearingsDto> {
    const [upcomingCount, items] = await Promise.all([
      this.hearingRepository.countUpcomingHearings(workspaceId, now),
      this.hearingRepository.findUpcomingHearings(workspaceId, now, 10),
    ]);

    return {
      upcomingCount,
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
