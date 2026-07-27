import type { CaseStatus, Prisma, PrismaClient } from '@prisma/client';
import type { ListCasesQuery } from '../dto/case.dto';

const caseInclude = {
  client: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      email: true,
      phone: true,
      companyName: true,
    },
  },
  assignedTo: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
  members: {
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
    },
  },
  hearings: {
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      status: true,
      hearingType: true,
      courtName: true,
      location: true,
      createdAt: true,
    },
    orderBy: { scheduledAt: 'asc' as const },
    take: 20,
  },
  deadlines: {
    select: { id: true, title: true, dueAt: true, status: true, type: true, importance: true },
    orderBy: { dueAt: 'asc' as const },
    take: 20,
  },
  documents: {
    select: { id: true, title: true, fileName: true, category: true, sizeBytes: true, createdAt: true, mimeType: true },
    orderBy: { createdAt: 'desc' as const },
    take: 20,
  },
  invoices: {
    select: {
      id: true,
      number: true,
      amount: true,
      currency: true,
      status: true,
      issuedAt: true,
      dueAt: true,
      paidAt: true,
    },
    orderBy: { issuedAt: 'desc' as const },
    take: 50,
  },
} satisfies Prisma.CaseInclude;

export type CaseRow = Prisma.CaseGetPayload<{ include: typeof caseInclude }>;

export class CaseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(workspaceId: string, query: ListCasesQuery): Promise<{ rows: CaseRow[]; total: number }> {
    const where: Prisma.CaseWhereInput = { workspaceId };
    if (query.status && query.status !== 'ALL') where.status = query.status as CaseStatus;
    if (query.clientId) where.clientId = query.clientId;
    if (query.assignedToUserId) where.assignedToUserId = query.assignedToUserId;
    if (query.practiceArea) where.practiceArea = { contains: query.practiceArea, mode: 'insensitive' };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { caseNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [rows, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        include: caseInclude,
        orderBy: { [query.sortBy]: query.sortDir },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.case.count({ where }),
    ]);
    return { rows, total };
  }

  async findById(workspaceId: string, id: string): Promise<CaseRow | null> {
    return this.prisma.case.findFirst({ where: { id, workspaceId }, include: caseInclude });
  }

  async create(data: Prisma.CaseCreateInput): Promise<CaseRow> {
    return this.prisma.case.create({ data, include: caseInclude });
  }

  async update(workspaceId: string, id: string, data: Prisma.CaseUpdateInput): Promise<CaseRow | null> {
    const existing = await this.prisma.case.findFirst({ where: { id, workspaceId }, select: { id: true } });
    if (!existing) return null;
    return this.prisma.case.update({ where: { id }, data, include: caseInclude });
  }

  async delete(workspaceId: string, id: string): Promise<boolean> {
    const existing = await this.prisma.case.findFirst({ where: { id, workspaceId }, select: { id: true } });
    if (!existing) return false;
    await this.prisma.case.delete({ where: { id } });
    return true;
  }

  async bulkDelete(workspaceId: string, ids: string[]): Promise<number> {
    const result = await this.prisma.case.deleteMany({ where: { id: { in: ids }, workspaceId } });
    return result.count;
  }

  async syncMembers(workspaceId: string, caseId: string, userIds: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.caseMember.deleteMany({ where: { caseId, workspaceId } }),
      ...userIds.map((userId) =>
        this.prisma.caseMember.create({ data: { workspaceId, caseId, userId } }),
      ),
    ]);
  }

  async stats(workspaceId: string) {
    const statuses: CaseStatus[] = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'ACTIVE', 'CLOSED', 'WON', 'LOST', 'DISMISSED', 'ARCHIVED'];
    const counts = await Promise.all(
      statuses.map((status) => this.prisma.case.count({ where: { workspaceId, status } })),
    );
    return Object.fromEntries(statuses.map((s, i) => [s, counts[i]]));
  }
}
