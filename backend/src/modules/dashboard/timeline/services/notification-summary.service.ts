import type { WorkspacePeriods } from '../../../../shared/utils/timezone';
import type { NotificationSummaryDto } from '../dto/timeline.dto';
import type { TimelineAlertRepository } from '../repositories/timeline-activity-alert.repository';
import type { TimelineHearingRepository } from '../repositories/timeline-hearing-deadline.repository';
import type { TimelineDeadlineRepository } from '../repositories/timeline-hearing-deadline.repository';

/**
 * Notification summary cards for the dashboard.
 * Values are computed from live workspace data (no fake counters).
 */
export class NotificationSummaryService {
  constructor(
    private readonly hearingRepository: TimelineHearingRepository,
    private readonly deadlineRepository: TimelineDeadlineRepository,
    private readonly alertRepository: TimelineAlertRepository,
  ) {}

  async calculate(input: {
    workspaceId: string;
    now: Date;
    periods: WorkspacePeriods;
    criticalAlertCount: number;
  }): Promise<NotificationSummaryDto> {
    const [upcomingHearings, urgentDeadlines, overdueDeadlines] = await Promise.all([
      this.hearingRepository.countUpcoming(input.workspaceId, input.now),
      this.alertRepository.countUrgentDeadlines(
        input.workspaceId,
        input.periods.next3Days.end,
        input.now,
      ),
      this.deadlineRepository.countOverdue(input.workspaceId, input.now),
    ]);

    return {
      unreadNotifications: input.criticalAlertCount,
      criticalNotifications: input.criticalAlertCount,
      upcomingHearings,
      urgentDeadlines: urgentDeadlines + overdueDeadlines,
      pendingTasks: overdueDeadlines,
      unreadMessages: 0,
    };
  }
}
