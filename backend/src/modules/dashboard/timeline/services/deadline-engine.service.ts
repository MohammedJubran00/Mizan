import type { WorkspacePeriods } from '../../../../shared/utils/timezone';
import type { DeadlinesDashboardDto } from '../dto/timeline.dto';
import type { TimelineFilterInput } from '../filters/timeline-filter';
import type { TimelineDeadlineRepository } from '../repositories/timeline-hearing-deadline.repository';
import type { PriorityCalculationService } from './priority-calculation.service';
import {
  buildPaginationMeta,
  formatLocalDate,
  formatLocalTime,
} from '../utils/timeline-format';

/**
 * Deadline engine with typed deadlines and centralized priority calculation.
 */
export class DeadlineEngineService {
  constructor(
    private readonly deadlineRepository: TimelineDeadlineRepository,
    private readonly priorityService: PriorityCalculationService,
  ) {}

  async calculate(input: {
    workspaceId: string;
    now: Date;
    periods: WorkspacePeriods;
    timezone: string;
    filter: TimelineFilterInput;
  }): Promise<DeadlinesDashboardDto> {
    const [
      dueToday,
      dueTomorrow,
      dueThisWeek,
      dueThisMonth,
      overdue,
      completed,
      cancelled,
      upcoming,
      within24Hours,
      within3Days,
      within7Days,
      within30Days,
      listed,
    ] = await Promise.all([
      this.deadlineRepository.countInPeriod(input.workspaceId, input.periods.today),
      this.deadlineRepository.countInPeriod(input.workspaceId, input.periods.tomorrow),
      this.deadlineRepository.countInPeriod(input.workspaceId, input.periods.thisWeek),
      this.deadlineRepository.countInPeriod(input.workspaceId, input.periods.thisMonth),
      this.deadlineRepository.countOverdue(input.workspaceId, input.now),
      this.deadlineRepository.countByStatus(input.workspaceId, 'COMPLETED'),
      this.deadlineRepository.countByStatus(input.workspaceId, 'CANCELLED'),
      this.deadlineRepository.countUpcoming(input.workspaceId, input.now),
      this.deadlineRepository.countInPeriod(input.workspaceId, input.periods.next24Hours),
      this.deadlineRepository.countInPeriod(input.workspaceId, input.periods.next3Days),
      this.deadlineRepository.countInPeriod(input.workspaceId, input.periods.next7Days),
      this.deadlineRepository.countInPeriod(input.workspaceId, input.periods.next30Days),
      this.deadlineRepository.list({
        workspaceId: input.workspaceId,
        now: input.now,
        page: input.filter.deadlinePage,
        pageSize: input.filter.deadlinePageSize,
        cursor: input.filter.deadlineCursor,
        type: input.filter.deadlineType,
        openOnly: true,
      }),
    ]);

    const deadlines = listed.rows.map((row) => {
      const daysRemaining = this.priorityService.daysRemaining(row.dueAt, input.now);
      const priority = this.priorityService.calculateDeadlinePriority({
        dueAt: row.dueAt,
        now: input.now,
        importance: row.importance,
        status: row.status,
      });

      return {
        id: row.id,
        caseId: row.caseId,
        caseNumber: row.caseNumber,
        caseTitle: row.caseTitle,
        title: row.title,
        type: row.type,
        importance: row.importance,
        status: row.status,
        dueAt: row.dueAt.toISOString(),
        dueDate: formatLocalDate(row.dueAt, input.timezone),
        dueTime: formatLocalTime(row.dueAt, input.timezone),
        priority,
        daysRemaining,
      };
    });

    const pagination = buildPaginationMeta({
      page: input.filter.deadlinePage,
      pageSize: input.filter.deadlinePageSize,
      total: listed.total,
      items: listed.rows.map((row) => ({ id: row.id, dueAt: row.dueAt })),
      cursorField: 'dueAt',
    });

    return {
      todayCount: dueToday,
      upcomingCount: upcoming,
      overdueCount: overdue,
      completedCount: completed,
      windows: {
        within24Hours,
        within3Days,
        within7Days,
        within30Days,
      },
      items: deadlines.map((item) => ({
        id: item.id,
        title: item.title,
        dueAt: item.dueAt,
        status: item.status,
        caseId: item.caseId,
      })),
      summary: {
        dueToday,
        dueTomorrow,
        dueThisWeek,
        dueThisMonth,
        overdue,
        completed,
        cancelled,
        upcoming,
      },
      deadlines,
      pagination,
    };
  }
}
