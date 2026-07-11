import type { ActivityType, PrismaClient } from '@prisma/client';

export interface ActivityProjection {
  id: string;
  workspaceId: string;
  type: ActivityType;
  title: string;
  description: string | null;
  entityType: string | null;
  entityId: string | null;
  userId: string | null;
  createdAt: Date;
  actor: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface RecordActivityInput {
  workspaceId: string;
  actorId?: string | null;
  type: ActivityType;
  title: string;
  description?: string | null;
  targetType?: string | null;
  targetId?: string | null;
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
    const rows = await this.db.activity.findMany({
      where: { workspaceId },
      select: {
        id: true,
        workspaceId: true,
        type: true,
        title: true,
        description: true,
        entityType: true,
        entityId: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    return rows.map((row) => ({
      id: row.id,
      workspaceId: row.workspaceId,
      type: row.type,
      title: row.title,
      description: row.description,
      entityType: row.entityType,
      entityId: row.entityId,
      userId: row.userId,
      createdAt: row.createdAt,
      actor: row.user
        ? {
            id: row.user.id,
            fullName: row.user.fullName,
            email: row.user.email,
          }
        : null,
    }));
  }

  async create(input: RecordActivityInput): Promise<ActivityProjection> {
    const row = await this.db.activity.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.actorId ?? null,
        type: input.type,
        title: input.title,
        description: input.description ?? null,
        entityType: input.targetType ?? null,
        entityId: input.targetId ?? null,
      },
      select: {
        id: true,
        workspaceId: true,
        type: true,
        title: true,
        description: true,
        entityType: true,
        entityId: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      id: row.id,
      workspaceId: row.workspaceId,
      type: row.type,
      title: row.title,
      description: row.description,
      entityType: row.entityType,
      entityId: row.entityId,
      userId: row.userId,
      createdAt: row.createdAt,
      actor: row.user
        ? {
            id: row.user.id,
            fullName: row.user.fullName,
            email: row.user.email,
          }
        : null,
    };
  }
}
