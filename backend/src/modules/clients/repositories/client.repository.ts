import type { ClientStatus, Prisma, PrismaClient } from '@prisma/client';
import type { ListClientsQuery } from '../dto/client.dto';

const clientInclude = {
  cases: {
    select: { id: true, title: true, caseNumber: true, status: true, practiceArea: true, openedAt: true, closedAt: true },
    orderBy: { createdAt: 'desc' as const },
    take: 20,
  },
  invoices: {
    select: { id: true, number: true, amount: true, currency: true, status: true, issuedAt: true },
    orderBy: { issuedAt: 'desc' as const },
    take: 20,
  },
  documents: {
    select: { id: true, title: true, fileName: true, category: true, sizeBytes: true, createdAt: true },
    orderBy: { createdAt: 'desc' as const },
    take: 20,
  },
} satisfies Prisma.ClientInclude;

export type ClientRow = Prisma.ClientGetPayload<{ include: typeof clientInclude }>;

export interface CreateClientRecord {
  workspaceId: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  occupation?: string | null;
  nationalId?: string | null;
  dateOfBirth?: Date | null;
  avatarUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  addressCountry?: string | null;
  addressCity?: string | null;
  addressStreet?: string | null;
  addressPostalCode?: string | null;
  notes?: string | null;
  tags?: string[];
}

export type UpdateClientRecord = Partial<CreateClientRecord> & { status?: ClientStatus; lastActivityAt?: Date };

export class ClientRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(workspaceId: string, query: ListClientsQuery): Promise<{ rows: ClientRow[]; total: number }> {
    const where: Prisma.ClientWhereInput = { workspaceId };
    if (query.status !== 'ALL') where.status = query.status as ClientStatus;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: clientInclude,
        orderBy: { [query.sortBy]: query.sortDir },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.client.count({ where }),
    ]);
    return { rows, total };
  }

  async findById(workspaceId: string, id: string): Promise<ClientRow | null> {
    return this.prisma.client.findFirst({ where: { id, workspaceId }, include: clientInclude });
  }

  async create(input: CreateClientRecord): Promise<ClientRow> {
    return this.prisma.client.create({ data: input, include: clientInclude });
  }

  async update(workspaceId: string, id: string, input: UpdateClientRecord): Promise<ClientRow | null> {
    const existing = await this.prisma.client.findFirst({ where: { id, workspaceId } });
    if (!existing) return null;
    return this.prisma.client.update({ where: { id }, data: input, include: clientInclude });
  }

  async delete(workspaceId: string, id: string): Promise<boolean> {
    const existing = await this.prisma.client.findFirst({ where: { id, workspaceId }, select: { id: true } });
    if (!existing) return false;
    await this.prisma.client.delete({ where: { id } });
    return true;
  }

  async countByWorkspace(workspaceId: string): Promise<number> {
    return this.prisma.client.count({ where: { workspaceId } });
  }
}
