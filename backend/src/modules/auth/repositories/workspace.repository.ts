import type { PrismaClient, WorkspaceRole } from '@prisma/client';

export interface CreateWorkspaceWithOwnerData {
  name: string;
  slug: string;
  ownerUserId: string;
}

export interface WorkspaceMembership {
  workspaceId: string;
  role: WorkspaceRole;
  workspaceName: string;
}

export class WorkspaceRepository {
  constructor(private readonly db: PrismaClient) {}

  async createWithOwner(data: CreateWorkspaceWithOwnerData): Promise<WorkspaceMembership> {
    const workspace = await this.db.workspace.create({
      data: {
        name: data.name,
        slug: data.slug,
        members: {
          create: {
            userId: data.ownerUserId,
            role: 'OWNER',
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      role: 'OWNER',
    };
  }

  async findPrimaryMembership(userId: string): Promise<WorkspaceMembership | null> {
    const membership = await this.db.workspaceMember.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        workspaceId: true,
        role: true,
        workspace: { select: { name: true } },
      },
    });

    if (!membership) {
      return null;
    }

    return {
      workspaceId: membership.workspaceId,
      role: membership.role,
      workspaceName: membership.workspace.name,
    };
  }

  async findMembership(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMembership | null> {
    const membership = await this.db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
      select: {
        workspaceId: true,
        role: true,
        workspace: { select: { name: true } },
      },
    });

    if (!membership) {
      return null;
    }

    return {
      workspaceId: membership.workspaceId,
      role: membership.role,
      workspaceName: membership.workspace.name,
    };
  }
}
