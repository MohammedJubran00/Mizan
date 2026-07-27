import type { Prisma, PrismaClient, WorkspaceRole } from '@prisma/client';
import type { ListMembersQuery } from '../dto/users.dto';
import crypto from 'crypto';

const memberInclude = {
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
    },
  },
} satisfies Prisma.WorkspaceMemberInclude;

export type MemberRow = Prisma.WorkspaceMemberGetPayload<{ include: typeof memberInclude }>;

export class UsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(workspaceId: string, query: ListMembersQuery): Promise<{ rows: MemberRow[]; total: number }> {
    const where: Prisma.WorkspaceMemberWhereInput = { workspaceId };
    if (query.role !== 'ALL') where.role = query.role as WorkspaceRole;
    if (query.isActive === 'true') where.isActive = true;
    if (query.isActive === 'false') where.isActive = false;
    if (query.search) {
      where.user = {
        OR: [
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.workspaceMember.findMany({
        where,
        include: memberInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.workspaceMember.count({ where }),
    ]);
    return { rows, total };
  }

  async findById(workspaceId: string, memberId: string): Promise<MemberRow | null> {
    return this.prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
      include: memberInclude,
    });
  }

  async findByUserId(workspaceId: string, userId: string): Promise<MemberRow | null> {
    return this.prisma.workspaceMember.findFirst({
      where: { userId, workspaceId },
      include: memberInclude,
    });
  }

  async update(workspaceId: string, memberId: string, data: Prisma.WorkspaceMemberUpdateInput): Promise<MemberRow | null> {
    const existing = await this.prisma.workspaceMember.findFirst({ where: { id: memberId, workspaceId }, select: { id: true } });
    if (!existing) return null;
    return this.prisma.workspaceMember.update({ where: { id: memberId }, data, include: memberInclude });
  }

  async inviteOrCreate(workspaceId: string, input: { email: string; fullName: string; role: WorkspaceRole; phone?: string | null; department?: string | null; jobTitle?: string | null }): Promise<MemberRow> {
    const existingUser = await this.prisma.user.findUnique({ where: { email: input.email } });

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const user = await this.prisma.user.create({
        data: {
          email: input.email,
          fullName: input.fullName,
          passwordHash: crypto.randomBytes(32).toString('hex'),
        },
      });
      userId = user.id;
    }

    const existingMember = await this.prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId } } });
    if (existingMember) {
      return this.prisma.workspaceMember.update({
        where: { id: existingMember.id },
        data: { role: input.role, isActive: true, phone: input.phone, department: input.department, jobTitle: input.jobTitle },
        include: memberInclude,
      });
    }

    return this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role: input.role,
        phone: input.phone,
        department: input.department,
        jobTitle: input.jobTitle,
      },
      include: memberInclude,
    });
  }

  async remove(workspaceId: string, memberId: string): Promise<boolean> {
    const existing = await this.prisma.workspaceMember.findFirst({ where: { id: memberId, workspaceId }, select: { id: true, role: true } });
    if (!existing) return false;
    if (existing.role === 'OWNER') throw new Error('Cannot remove the workspace owner.');
    await this.prisma.workspaceMember.delete({ where: { id: memberId } });
    return true;
  }
}
