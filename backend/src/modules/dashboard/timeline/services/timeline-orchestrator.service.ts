import type { WorkspacePeriods } from '../../../../shared/utils/timezone';
import type {
  ActivitiesDashboardDto,
  DashboardAlertsDto,
  DeadlinesDashboardDto,
  HearingsDashboardDto,
  NotificationSummaryDto,
} from '../dto/timeline.dto';
import type { TimelineFilterInput } from '../filters/timeline-filter';
import type { ActivityTimelineService } from './activity-timeline.service';
import type { AlertEngineService } from './alert-engine.service';
import type { DeadlineEngineService } from './deadline-engine.service';
import type { HearingEngineService } from './hearing-engine.service';
import type { NotificationSummaryService } from './notification-summary.service';

export interface TimelineBundle {
  hearings: HearingsDashboardDto;
  deadlines: DeadlinesDashboardDto;
  activities: ActivitiesDashboardDto;
  alerts: DashboardAlertsDto;
  notifications: NotificationSummaryDto;
}

/**
 * Orchestrates hearing / deadline / activity / alert / notification engines in parallel.
 * Each engine is independently cacheable later.
 */
export class TimelineOrchestratorService {
  constructor(
    private readonly hearingEngine: HearingEngineService,
    private readonly deadlineEngine: DeadlineEngineService,
    private readonly activityTimeline: ActivityTimelineService,
    private readonly alertEngine: AlertEngineService,
    private readonly notificationSummary: NotificationSummaryService,
  ) {}

  async calculateAll(input: {
    workspaceId: string;
    timezone: string;
    now: Date;
    periods: WorkspacePeriods;
    filter: TimelineFilterInput;
  }): Promise<TimelineBundle> {
    const [hearings, deadlines, activities, alerts] = await Promise.all([
      this.hearingEngine.calculate(input),
      this.deadlineEngine.calculate(input),
      this.activityTimeline.calculate(input),
      this.alertEngine.calculate(input),
    ]);

    const notifications = await this.notificationSummary.calculate({
      workspaceId: input.workspaceId,
      now: input.now,
      periods: input.periods,
      criticalAlertCount: alerts.criticalCount,
    });

    return { hearings, deadlines, activities, alerts, notifications };
  }
}
