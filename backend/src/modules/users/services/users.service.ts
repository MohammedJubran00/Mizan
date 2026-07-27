import type { WorkspaceRole } from '@prisma/client';
import { AppError } from '../../../shared/errors/AppError';
import type { AuthContext } from '../../../shared/types/auth-context';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';
import type { InviteMemberInput, ListMembersQuery, UpdateMemberInput } from '../dto/users.dto';
import type { MemberRow, UsersRepository } from '../repositories/users.repository';

function mapMember(row: MemberRow) {
  return {
    id: row.id,
    userId: row.userId,
    role: row.role,
    isActive: row.isActive,
    phone: row.phone ?? null,
    department: row.department ?? null,
    jobTitle: row.jobTitle ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    user: {
      id: row.user.id,
      fullName: row.user.fullName,
      email: row.user.email,
      avatarUrl: row.user.avatarUrl ?? null,
      createdAt: row.user.createdAt.toISOString(),
    },
  };
}

export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly activityEngine?: ActivityEngineService,
    private readonly cacheInvalidator?: CacheInvalidator,
  ) {}

  async list(auth: AuthContext, query: ListMembersQuery) {
    const { rows, total } = await this.repository.findMany(auth.workspaceId, query);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);
    return {
      success: true,
      items: rows.map(mapMember),
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages, hasMore: query.page < totalPages },
    };
  }

  async getById(auth: AuthContext, memberId: string) {
    const row = await this.repository.findById(auth.workspaceId, memberId);
    if (!row) throw new AppError(404, 'Member not found.');
    return mapMember(row);
  }

  async update(auth: AuthContext, memberId: string, input: UpdateMemberInput) {
    const existing = await this.repository.findById(auth.workspaceId, memberId);
    if (!existing) throw new AppError(404, 'Member not found.');

    const row = await this.repository.update(auth.workspaceId, memberId, {
      role: input.role as WorkspaceRole | undefined,
      isActive: input.isActive,
      phone: input.phone,
      department: input.department,
      jobTitle: input.jobTitle,
    });
    if (!row) throw new AppError(404, 'Member not found.');

    if (input.role) {
      await this.activityEngine?.recordRoleChanged({ workspaceId: auth.workspaceId, actorId: auth.user.id, userId: row.userId, fullName: row.user.fullName, role: input.role });
    } else {
      await this.activityEngine?.recordUserUpdated({ workspaceId: auth.workspaceId, actorId: auth.user.id, userId: row.userId, fullName: row.user.fullName });
    }

    return mapMember(row);
  }

  async invite(auth: AuthContext, input: InviteMemberInput) {
    const row = await this.repository.inviteOrCreate(auth.workspaceId, {
      email: input.email,
      fullName: input.fullName,
      role: input.role as WorkspaceRole,
      phone: input.phone,
      department: input.department,
      jobTitle: input.jobTitle,
    });
    await this.activityEngine?.recordUserInvited({ workspaceId: auth.workspaceId, actorId: auth.user.id, userId: row.userId, fullName: row.user.fullName });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'USER_INVITED');
    return mapMember(row);
  }

  async remove(auth: AuthContext, memberId: string): Promise<void> {
    const member = await this.repository.findById(auth.workspaceId, memberId);
    if (!member) throw new AppError(404, 'Member not found.');
    try {
      await this.repository.remove(auth.workspaceId, memberId);
    } catch (err: any) {
      throw new AppError(400, err.message ?? 'Cannot remove member.');
    }
    await this.activityEngine?.recordUserRemoved({ workspaceId: auth.workspaceId, actorId: auth.user.id, userId: member.userId, fullName: member.user.fullName });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'USER_REMOVED');
  }

  roles() {
    return {
      success: true,
      items: [
        { id: 'OWNER', name: 'Owner', description: 'Full access — cannot be removed.', permissions: ['*'] },
        { id: 'ADMIN', name: 'Admin', description: 'Full admin access.', permissions: ['manage:workspace', 'manage:members', 'manage:cases', 'manage:billing'] },
        { id: 'LAWYER', name: 'Lawyer', description: 'Create and manage cases, hearings, billing.', permissions: ['create:cases', 'manage:billing', 'view:clients'] },
        { id: 'ASSISTANT', name: 'Assistant', description: 'Read/write cases and hearings; read-only billing.', permissions: ['create:cases', 'view:billing'] },
        { id: 'MEMBER', name: 'Member', description: 'Read-only access.', permissions: ['view:cases', 'view:clients'] },
      ],
    };
  }
}
