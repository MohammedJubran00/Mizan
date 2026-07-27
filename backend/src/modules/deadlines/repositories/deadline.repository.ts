import type { DeadlineImportance, DeadlineStatus, DeadlineType, Prisma, PrismaClient } from '@prisma/client';
import type { ListDeadlinesQuery } from '../dto/deadline.dto';

const deadlineInclude = {
  case: { select: { id: true, title: true, caseNumber: true } },
} satisfies Prisma.DeadlineInclude;

export type DeadlineRow = Prisma.DeadlineGetPayload<{ include: typeof deadlineInclude }>;

export class DeadlineRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(workspaceId: string, query: ListDeadlinesQuery): Promise<{ rows: DeadlineRow[]; total: number }> {
    const where: Prisma.DeadlineWhereInput = { workspaceId };
    if (query.caseId) where.caseId = query.caseId;
    if (query.status && query.status !== 'ALL') where.status = query.status as DeadlineStatus;
    if (query.type && query.type !== 'ALL') where.type = query.type as DeadlineType;
    if (query.importance && query.importance !== 'ALL') where.importance = query.importance as DeadlineImportance;
    if (query.from || query.to) {
      where.dueAt = {};
      if (query.from) where.dueAt.gte = query.from;
      if (query.to) where.dueAt.lte = query.to;
    }

    const [rows, total] = await Promise.all([
      this.prisma.deadline.findMany({
        where,
        include: deadlineInclude,
        orderBy: { [query.sortBy]: query.sortDir },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.deadline.count({ where }),
    ]);
    return { rows, total };
  }

  async findById(workspaceId: string, id: string): Promise<DeadlineRow | null> {
    return this.prisma.deadline.findFirst({ where: { id, workspaceId }, include: deadlineInclude });
  }

  async create(data: Prisma.DeadlineCreateInput): Promise<DeadlineRow> {
    return this.prisma.deadline.create({ data, include: deadlineInclude });
  }

  async update(workspaceId: string, id: string, data: Prisma.DeadlineUpdateInput): Promise<DeadlineRow | null> {
    const existing = await this.prisma.deadline.findFirst({ where: { id, workspaceId }, select: { id: true } });
    if (!existing) return null;
    return this.prisma.deadline.update({ where: { id }, data, include: deadlineInclude });
  }

  async delete(workspaceId: string, id: string): Promise<boolean> {
    const existing = await this.prisma.deadline.findFirst({ where: { id, workspaceId }, select: { id: true } });
    if (!existing) return false;
    await this.prisma.deadline.delete({ where: { id } });
    return true;
  }
}
