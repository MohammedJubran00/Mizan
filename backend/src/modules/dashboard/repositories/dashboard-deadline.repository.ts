import type { DeadlineStatus, PrismaClient } from '@prisma/client';

export interface DeadlineProjection {
  id: string;
  title: string;
  dueAt: Date;
  status: DeadlineStatus;
  caseId: string | null;
}

export class DashboardDeadlineRepository {
  constructor(private readonly db: PrismaClient) {}

  async countUpcomingDeadlines(workspaceId: string, from: Date): Promise<number> {
    return this.db.deadline.count({
      where: {
        workspaceId,
        status: { in: ['PENDING', 'OVERDUE'] },
        dueAt: { gte: from },
      },
    });
  }

  async countOverdueDeadlines(workspaceId: string, before: Date): Promise<number> {
    return this.db.deadline.count({
      where: {
        workspaceId,
        status: { in: ['PENDING', 'OVERDUE'] },
        dueAt: { lt: before },
      },
    });
  }

  async findUpcomingDeadlines(
    workspaceId: string,
    from: Date,
    take: number,
  ): Promise<DeadlineProjection[]> {
    return this.db.deadline.findMany({
      where: {
        workspaceId,
        status: { in: ['PENDING', 'OVERDUE'] },
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
