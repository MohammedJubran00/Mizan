import type { ActivityType, PrismaClient } from '@prisma/client';

export interface ActivityProjection {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  entityType: string | null;
  entityId: string | null;
  userId: string | null;
  createdAt: Date;
}

export class DashboardActivityRepository {
  constructor(private readonly db: PrismaClient) {}

  async countActivities(workspaceId: string): Promise<number> {
    return this.db.activity.count({ where: { workspaceId } });
  }

  async findRecentActivities(
    workspaceId: string,
    take: number,
  ): Promise<ActivityProjection[]> {
    return this.db.activity.findMany({
      where: { workspaceId },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        entityType: true,
        entityId: true,
        userId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}
