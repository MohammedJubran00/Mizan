import type {
  ActivitySeverity,
  ActivityType,
  Prisma,
  PrismaClient,
} from '@prisma/client';

export interface ActivityProjection {
  id: string;
  workspaceId: string;
  type: ActivityType;
  title: string;
  description: string | null;
  entityType: string | null;
  entityId: string | null;
  targetName: string | null;
  severity: ActivitySeverity;
  icon: string | null;
  color: string | null;
  metadata: Prisma.JsonValue | null;
  userId: string | null;
  createdAt: Date;
  actor: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
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
  targetName?: string | null;
  severity?: ActivitySeverity;
  icon?: string | null;
  color?: string | null;
  metadata?: Prisma.InputJsonValue;
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
        targetName: true,
        severity: true,
        icon: true,
        color: true,
        metadata: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    return rows.map((row) => ({
      ...row,
      actor: row.user,
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
        targetName: input.targetName ?? null,
        severity: input.severity ?? 'INFO',
        icon: input.icon ?? null,
        color: input.color ?? null,
        metadata: input.metadata ?? undefined,
      },
      select: {
        id: true,
        workspaceId: true,
        type: true,
        title: true,
        description: true,
        entityType: true,
        entityId: true,
        targetName: true,
        severity: true,
        icon: true,
        color: true,
        metadata: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      ...row,
      actor: row.user,
    };
  }
}
