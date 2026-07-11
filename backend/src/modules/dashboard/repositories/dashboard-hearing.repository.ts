import type { HearingStatus, PrismaClient } from '@prisma/client';

import type { PeriodBounds } from '../../../shared/utils/timezone';

export interface HearingProjection {
  id: string;
  title: string;
  scheduledAt: Date;
  status: HearingStatus;
  location: string | null;
  caseId: string | null;
}

export class DashboardHearingRepository {
  constructor(private readonly db: PrismaClient) {}

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

  async countByStatus(workspaceId: string, status: HearingStatus): Promise<number> {
    return this.db.hearing.count({ where: { workspaceId, status } });
  }

  async countUpcoming(workspaceId: string, from: Date): Promise<number> {
    return this.db.hearing.count({
      where: {
        workspaceId,
        status: 'SCHEDULED',
        scheduledAt: { gte: from },
      },
    });
  }

  async countOverdue(workspaceId: string, before: Date): Promise<number> {
    return this.db.hearing.count({
      where: {
        workspaceId,
        status: 'SCHEDULED',
        scheduledAt: { lt: before },
      },
    });
  }

  async findNearestUpcoming(
    workspaceId: string,
    from: Date,
    take: number,
  ): Promise<HearingProjection[]> {
    return this.db.hearing.findMany({
      where: {
        workspaceId,
        status: 'SCHEDULED',
        scheduledAt: { gte: from },
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        status: true,
        location: true,
        caseId: true,
      },
      orderBy: { scheduledAt: 'asc' },
      take,
    });
  }
}
