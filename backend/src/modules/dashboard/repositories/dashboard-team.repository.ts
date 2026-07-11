import type { PrismaClient, WorkspaceRole } from '@prisma/client';

export interface TeamMemberProjection {
  userId: string;
  fullName: string;
  email: string;
  role: WorkspaceRole;
}

export class DashboardTeamRepository {
  constructor(private readonly db: PrismaClient) {}

  async countMembers(workspaceId: string): Promise<number> {
    return this.db.workspaceMember.count({ where: { workspaceId } });
  }

  async findMembers(workspaceId: string, take: number): Promise<TeamMemberProjection[]> {
    const rows = await this.db.workspaceMember.findMany({
      where: { workspaceId },
      select: {
        userId: true,
        role: true,
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
    }));
  }
}
