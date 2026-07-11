import type { WorkspacePeriods } from '../../../../shared/utils/timezone';
import type { HearingsDashboardDto } from '../dto/timeline.dto';
import type { TimelineFilterInput } from '../filters/timeline-filter';
import type { TimelineHearingRepository } from '../repositories/timeline-hearing-deadline.repository';
import type { PriorityCalculationService } from './priority-calculation.service';
import {
  buildPaginationMeta,
  formatLocalDate,
  formatLocalTime,
} from '../utils/timeline-format';

/**
 * Upcoming hearings engine — workspace-scoped, paginated, timezone-aware.
 */
export class HearingEngineService {
  constructor(
    private readonly hearingRepository: TimelineHearingRepository,
    private readonly priorityService: PriorityCalculationService,
  ) {}

  async calculate(input: {
    workspaceId: string;
    now: Date;
    periods: WorkspacePeriods;
    timezone: string;
    filter: TimelineFilterInput;
  }): Promise<HearingsDashboardDto> {
    const range = resolveHearingRange(input.filter, input.periods, input.now);

    const [
      today,
      tomorrow,
      upcoming,
      completed,
      cancelled,
      rescheduled,
      overdue,
      listed,
    ] = await Promise.all([
      this.hearingRepository.countInPeriod(input.workspaceId, input.periods.today, [
        'SCHEDULED',
      ]),
      this.hearingRepository.countInPeriod(input.workspaceId, input.periods.tomorrow, [
        'SCHEDULED',
      ]),
      this.hearingRepository.countUpcoming(input.workspaceId, input.now),
      this.hearingRepository.countByStatus(input.workspaceId, 'COMPLETED'),
      this.hearingRepository.countByStatus(input.workspaceId, 'CANCELLED'),
      this.hearingRepository.countByStatus(input.workspaceId, 'RESCHEDULED'),
      this.hearingRepository.countOverdue(input.workspaceId, input.now),
      this.hearingRepository.list({
        workspaceId: input.workspaceId,
        now: input.now,
        page: input.filter.hearingPage,
        pageSize: input.filter.hearingPageSize,
        cursor: input.filter.hearingCursor,
        upcomingOnly: true,
        rangeStart: range.start,
        rangeEnd: range.end,
      }),
    ]);

    const hearings = listed.rows.map((row) => {
      const daysRemaining = this.priorityService.daysRemaining(row.scheduledAt, input.now);
      const priority = this.priorityService.calculateHearingPriority({
        scheduledAt: row.scheduledAt,
        now: input.now,
        status: row.status,
      });

      return {
        id: row.id,
        caseId: row.caseId,
        caseNumber: row.caseNumber,
        caseTitle: row.caseTitle,
        clientName: row.clientName,
        courtName: row.courtName ?? row.location,
        location: row.location,
        assignedLawyer: row.lawyerName,
        assignedLawyerId: row.assignedLawyerId,
        hearingDate: formatLocalDate(row.scheduledAt, input.timezone),
        hearingTime: formatLocalTime(row.scheduledAt, input.timezone),
        scheduledAt: row.scheduledAt.toISOString(),
        hearingType: row.hearingType,
        status: row.status,
        priority,
        daysRemaining,
        title: row.title,
      };
    });

    const pagination = buildPaginationMeta({
      page: input.filter.hearingPage,
      pageSize: input.filter.hearingPageSize,
      total: listed.total,
      items: listed.rows.map((row) => ({
        id: row.id,
        scheduledAt: row.scheduledAt,
      })),
      cursorField: 'scheduledAt',
    });

    return {
      todayCount: today,
      upcomingCount: upcoming,
      overdueCount: overdue,
      completedCount: completed,
      cancelledCount: cancelled,
      items: hearings.map((item) => ({
        id: item.id,
        title: item.title,
        scheduledAt: item.scheduledAt,
        status: item.status,
        location: item.location,
        caseId: item.caseId,
      })),
      summary: {
        today,
        tomorrow,
        upcoming,
        completed,
        cancelled,
        rescheduled,
        overdue,
      },
      hearings,
      pagination,
    };
  }
}

function resolveHearingRange(
  filter: TimelineFilterInput,
  periods: WorkspacePeriods,
  now: Date,
): { start: Date; end?: Date } {
  if (filter.hearingRange === 'CUSTOM') {
    return {
      start: filter.hearingFrom ?? now,
      end: filter.hearingTo,
    };
  }

  switch (filter.hearingRange) {
    case 'TODAY':
      return { start: periods.today.start, end: periods.today.end };
    case 'TOMORROW':
      return { start: periods.tomorrow.start, end: periods.tomorrow.end };
    case 'THIS_WEEK':
      return { start: periods.thisWeek.start, end: periods.thisWeek.end };
    case 'NEXT_WEEK':
      return { start: periods.nextWeek.start, end: periods.nextWeek.end };
    case 'NEXT_30_DAYS':
    default:
      return { start: now, end: periods.next30Days.end };
  }
}
