import type { DeadlineStatus, PrismaClient } from '@prisma/client';

import type { PeriodBounds } from '../../../shared/utils/timezone';

export interface DeadlineProjection {
  id: string;
  title: string;
  dueAt: Date;
  status: DeadlineStatus;
  caseId: string | null;
}

const OPEN_STATUSES: DeadlineStatus[] = ['PENDING', 'OVERDUE'];

export class DashboardDeadlineRepository {
  constructor(private readonly db: PrismaClient) {}

  async countInPeriod(
    workspaceId: string,
    period: PeriodBounds,
    statuses: DeadlineStatus[] = OPEN_STATUSES,
  ): Promise<number> {
    return this.db.deadline.count({
      where: {
        workspaceId,
        status: { in: statuses },
        dueAt: { gte: period.start, lt: period.end },
      },
    });
  }

  async countUpcoming(workspaceId: string, from: Date): Promise<number> {
    return this.db.deadline.count({
      where: {
        workspaceId,
        status: { in: OPEN_STATUSES },
        dueAt: { gte: from },
      },
    });
  }

  async countOverdue(workspaceId: string, before: Date): Promise<number> {
    return this.db.deadline.count({
      where: {
        workspaceId,
        status: { in: OPEN_STATUSES },
        dueAt: { lt: before },
      },
    });
  }

  async countCompleted(workspaceId: string): Promise<number> {
    return this.db.deadline.count({
      where: { workspaceId, status: 'COMPLETED' },
    });
  }

  async findNearestUpcoming(
    workspaceId: string,
    from: Date,
    take: number,
  ): Promise<DeadlineProjection[]> {
    return this.db.deadline.findMany({
      where: {
        workspaceId,
        status: { in: OPEN_STATUSES },
        dueAt: { gte: from },
      },
      select: {
        id: true,
        title: true,
        dueAt: true,
        status: true,
        caseId: true,
      },
      orderBy: { dueAt: 'asc' },
      take,
    });
  }
}
