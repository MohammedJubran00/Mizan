import type {
  DeadlineImportance,
  DeadlineStatus,
  DeadlineType,
  HearingStatus,
  HearingType,
  PrismaClient,
} from '@prisma/client';

import type { PeriodBounds } from '../../../../shared/utils/timezone';
import { decodeCursor } from '../utils/timeline-format';

export interface HearingRow {
  id: string;
  title: string;
  scheduledAt: Date;
  status: HearingStatus;
  hearingType: HearingType;
  location: string | null;
  courtName: string | null;
  caseId: string | null;
  assignedLawyerId: string | null;
  caseTitle: string | null;
  caseNumber: string | null;
  clientName: string | null;
  lawyerName: string | null;
}

export interface DeadlineRow {
  id: string;
  title: string;
  dueAt: Date;
  status: DeadlineStatus;
  type: DeadlineType;
  importance: DeadlineImportance;
  caseId: string | null;
  caseTitle: string | null;
  caseNumber: string | null;
}

export interface HearingListQuery {
  workspaceId: string;
  rangeStart?: Date;
  rangeEnd?: Date;
  page: number;
  pageSize: number;
  cursor?: string;
  upcomingOnly?: boolean;
  now: Date;
}

export interface DeadlineListQuery {
  workspaceId: string;
  page: number;
  pageSize: number;
  cursor?: string;
  type?: DeadlineType;
  now: Date;
  openOnly?: boolean;
}

export class TimelineHearingRepository {
  constructor(private readonly db: PrismaClient) {}

  async countByStatus(workspaceId: string, status: HearingStatus): Promise<number> {
    return this.db.hearing.count({ where: { workspaceId, status } });
  }

  async countInPeriod(
    workspaceId: string,
    period: PeriodBounds,
    statuses?: HearingStatus[],
  ): Promise<number> {
    return this.db.hearing.count({
      where: {
        workspaceId,
        scheduledAt: { gte: period.start, lt: period.end },
        ...(statuses ? { status: { in: statuses } } : {}),
      },
    });
  }

  async countUpcoming(workspaceId: string, from: Date): Promise<number> {
    return this.db.hearing.count({
      where: { workspaceId, status: 'SCHEDULED', scheduledAt: { gte: from } },
    });
  }

  async countOverdue(workspaceId: string, before: Date): Promise<number> {
    return this.db.hearing.count({
      where: { workspaceId, status: 'SCHEDULED', scheduledAt: { lt: before } },
    });
  }

  async list(query: HearingListQuery): Promise<{ rows: HearingRow[]; total: number }> {
    const where: Record<string, unknown> = {
      workspaceId: query.workspaceId,
    };

    if (query.upcomingOnly) {
      where.status = 'SCHEDULED';
      where.scheduledAt = {
        ...(query.rangeStart ? { gte: query.rangeStart } : { gte: query.now }),
        ...(query.rangeEnd ? { lt: query.rangeEnd } : {}),
      };
    } else if (query.rangeStart || query.rangeEnd) {
      where.scheduledAt = {
        ...(query.rangeStart ? { gte: query.rangeStart } : {}),
        ...(query.rangeEnd ? { lt: query.rangeEnd } : {}),
      };
    }

    if (query.cursor) {
      const decoded = decodeCursor(query.cursor);
      if (decoded) {
        where.OR = [
          { scheduledAt: { gt: decoded.createdAt } },
          { scheduledAt: decoded.createdAt, id: { gt: decoded.id } },
        ];
      }
    }

    const [total, rows] = await Promise.all([
      this.db.hearing.count({ where }),
      this.db.hearing.findMany({
        where,
        select: {
          id: true,
          title: true,
          scheduledAt: true,
          status: true,
          hearingType: true,
          location: true,
          courtName: true,
          caseId: true,
          assignedLawyerId: true,
          case: {
            select: {
              title: true,
              caseNumber: true,
              client: { select: { name: true } },
            },
          },
          assignedLawyer: { select: { fullName: true } },
        },
        orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
        skip: query.cursor ? 0 : (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return {
      total,
      rows: rows.map((row) => ({
        id: row.id,
        title: row.title,
        scheduledAt: row.scheduledAt,
        status: row.status,
        hearingType: row.hearingType,
        location: row.location,
        courtName: row.courtName,
        caseId: row.caseId,
        assignedLawyerId: row.assignedLawyerId,
        caseTitle: row.case?.title ?? null,
        caseNumber: row.case?.caseNumber ?? null,
        clientName: row.case?.client?.name ?? null,
        lawyerName: row.assignedLawyer?.fullName ?? null,
      })),
    };
  }
}

export class TimelineDeadlineRepository {
  constructor(private readonly db: PrismaClient) {}

  async countInPeriod(
    workspaceId: string,
    period: PeriodBounds,
    statuses: DeadlineStatus[] = ['PENDING', 'OVERDUE'],
  ): Promise<number> {
    return this.db.deadline.count({
      where: {
        workspaceId,
        status: { in: statuses },
        dueAt: { gte: period.start, lt: period.end },
      },
    });
  }

  async countByStatus(workspaceId: string, status: DeadlineStatus): Promise<number> {
    return this.db.deadline.count({ where: { workspaceId, status } });
  }

  async countUpcoming(workspaceId: string, from: Date): Promise<number> {
    return this.db.deadline.count({
      where: {
        workspaceId,
        status: { in: ['PENDING', 'OVERDUE'] },
        dueAt: { gte: from },
      },
    });
  }

  async countOverdue(workspaceId: string, before: Date): Promise<number> {
    return this.db.deadline.count({
      where: {
        workspaceId,
        status: { in: ['PENDING', 'OVERDUE'] },
        dueAt: { lt: before },
      },
    });
  }

  async list(query: DeadlineListQuery): Promise<{ rows: DeadlineRow[]; total: number }> {
    const where: Record<string, unknown> = {
      workspaceId: query.workspaceId,
    };

    if (query.openOnly !== false) {
      where.status = { in: ['PENDING', 'OVERDUE'] };
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.cursor) {
      const decoded = decodeCursor(query.cursor);
      if (decoded) {
        where.OR = [
          { dueAt: { gt: decoded.createdAt } },
          { dueAt: decoded.createdAt, id: { gt: decoded.id } },
        ];
      }
    }

    const [total, rows] = await Promise.all([
      this.db.deadline.count({ where }),
      this.db.deadline.findMany({
        where,
        select: {
          id: true,
          title: true,
          dueAt: true,
          status: true,
          type: true,
          importance: true,
          caseId: true,
          case: {
            select: {
              title: true,
              caseNumber: true,
            },
          },
        },
        orderBy: [{ dueAt: 'asc' }, { id: 'asc' }],
        skip: query.cursor ? 0 : (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return {
      total,
      rows: rows.map((row) => ({
        id: row.id,
        title: row.title,
        dueAt: row.dueAt,
        status: row.status,
        type: row.type,
        importance: row.importance,
        caseId: row.caseId,
        caseTitle: row.case?.title ?? null,
        caseNumber: row.case?.caseNumber ?? null,
      })),
    };
  }
}
