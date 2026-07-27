import type { HearingStatus, HearingType, Prisma, PrismaClient } from '@prisma/client';
import type { ListHearingsQuery } from '../dto/hearing.dto';

const hearingInclude = {
  case: { select: { id: true, title: true, caseNumber: true, client: { select: { id: true, name: true } } } },
  assignedLawyer: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
} satisfies Prisma.HearingInclude;

export type HearingRow = Prisma.HearingGetPayload<{ include: typeof hearingInclude }>;

export class HearingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(workspaceId: string, query: ListHearingsQuery): Promise<{ rows: HearingRow[]; total: number }> {
    const where: Prisma.HearingWhereInput = { workspaceId };
    if (query.caseId) where.caseId = query.caseId;
    if (query.status && query.status !== 'ALL') where.status = query.status as HearingStatus;
    if (query.hearingType && query.hearingType !== 'ALL') where.hearingType = query.hearingType as HearingType;
    if (query.from || query.to) {
      where.scheduledAt = {};
      if (query.from) where.scheduledAt.gte = query.from;
      if (query.to) where.scheduledAt.lte = query.to;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { courtName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.hearing.findMany({
        where,
        include: hearingInclude,
        orderBy: { [query.sortBy]: query.sortDir },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.hearing.count({ where }),
    ]);
    return { rows, total };
  }

  async findCalendarRange(workspaceId: string, from: Date, to: Date): Promise<HearingRow[]> {
    return this.prisma.hearing.findMany({
      where: { workspaceId, scheduledAt: { gte: from, lte: to } },
      include: hearingInclude,
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findById(workspaceId: string, id: string): Promise<HearingRow | null> {
    return this.prisma.hearing.findFirst({ where: { id, workspaceId }, include: hearingInclude });
  }

  async create(data: Prisma.HearingCreateInput): Promise<HearingRow> {
    return this.prisma.hearing.create({ data, include: hearingInclude });
  }

  async update(workspaceId: string, id: string, data: Prisma.HearingUpdateInput): Promise<HearingRow | null> {
    const existing = await this.prisma.hearing.findFirst({ where: { id, workspaceId }, select: { id: true } });
    if (!existing) return null;
    return this.prisma.hearing.update({ where: { id }, data, include: hearingInclude });
  }

  async delete(workspaceId: string, id: string): Promise<boolean> {
    const existing = await this.prisma.hearing.findFirst({ where: { id, workspaceId }, select: { id: true } });
    if (!existing) return false;
    await this.prisma.hearing.delete({ where: { id } });
    return true;
  }
}
