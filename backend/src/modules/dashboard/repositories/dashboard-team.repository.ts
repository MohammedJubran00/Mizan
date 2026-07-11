import type { PrismaClient, WorkspaceRole } from '@prisma/client';

export interface TeamMemberProjection {
  userId: string;
  fullName: string;
  email: string;
  role: WorkspaceRole;
  isActive: boolean;
}

export interface RoleCountRow {
  role: WorkspaceRole;
  count: number;
}

export class DashboardTeamRepository {
  constructor(private readonly db: PrismaClient) {}

  async countMembers(workspaceId: string): Promise<number> {
    return this.db.workspaceMember.count({ where: { workspaceId } });
  }

  async countActiveMembers(workspaceId: string): Promise<number> {
    return this.db.workspaceMember.count({
      where: { workspaceId, isActive: true },
    });
  }

  async countByRole(workspaceId: string): Promise<RoleCountRow[]> {
    const rows = await this.db.workspaceMember.groupBy({
      by: ['role'],
      where: { workspaceId },
      _count: { _all: true },
    });

    return rows.map((row) => ({
      role: row.role,
      count: row._count._all,
    }));
  }

  async countLawyers(workspaceId: string): Promise<number> {
    return this.db.workspaceMember.count({
      where: { workspaceId, role: 'LAWYER' },
    });
  }

  async findMembers(workspaceId: string, take: number): Promise<TeamMemberProjection[]> {
    const rows = await this.db.workspaceMember.findMany({
      where: { workspaceId },
      select: {
        userId: true,
        role: true,
        isActive: true,
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      take,
    });

    return rows.map((row) => ({
      userId: row.userId,
      fullName: row.user.fullName,
      email: row.user.email,
      role: row.role,
      isActive: row.isActive,
    }));
  }
}
