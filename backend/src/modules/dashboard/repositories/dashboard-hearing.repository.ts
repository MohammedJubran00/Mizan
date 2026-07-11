import type { HearingStatus, PrismaClient } from '@prisma/client';

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

  async countUpcomingHearings(workspaceId: string, from: Date): Promise<number> {
    return this.db.hearing.count({
      where: {
        workspaceId,
        status: 'SCHEDULED',
        scheduledAt: { gte: from },
      },
    });
  }

  async findUpcomingHearings(
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
