import type {
  DocumentCategory,
  Prisma,
  PrismaClient,
} from '@prisma/client';

import type { ListDocumentsQuery } from '../dto/document-request.dto';

const documentInclude = {
  case: { select: { id: true, title: true, caseNumber: true } },
  client: { select: { id: true, name: true } },
  uploadedBy: { select: { id: true, fullName: true } },
} satisfies Prisma.DocumentInclude;

export type DocumentRow = Prisma.DocumentGetPayload<{
  include: typeof documentInclude;
}>;

export interface CreateDocumentRecord {
  workspaceId: string;
  caseId?: string | null;
  clientId?: string | null;
  uploadedById?: string | null;
  title: string;
  description?: string | null;
  category: DocumentCategory;
  fileName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
}

export interface UpdateDocumentRecord {
  title?: string;
  description?: string | null;
  category?: DocumentCategory;
  caseId?: string | null;
  clientId?: string | null;
}

export class DocumentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(
    workspaceId: string,
    query: ListDocumentsQuery,
  ): Promise<{ rows: DocumentRow[]; total: number }> {
    const where = buildWhere(workspaceId, query);

    const [rows, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: documentInclude,
        orderBy: { [query.sortBy]: query.sortDir },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.document.count({ where }),
    ]);

    return { rows, total };
  }

  async findById(workspaceId: string, id: string): Promise<DocumentRow | null> {
    return this.prisma.document.findFirst({
      where: { id, workspaceId },
      include: documentInclude,
    });
  }

  async create(input: CreateDocumentRecord): Promise<DocumentRow> {
    return this.prisma.document.create({
      data: input,
      include: documentInclude,
    });
  }

  async update(
    workspaceId: string,
    id: string,
    input: UpdateDocumentRecord,
  ): Promise<DocumentRow> {
    return this.prisma.document.update({
      where: { id },
      data: { ...input, workspaceId },
      include: documentInclude,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } });
  }

  async summarize(workspaceId: string, monthStart: Date) {
    const [aggregate, uploadedThisMonth, unlinkedCount] = await Promise.all([
      this.prisma.document.aggregate({
        where: { workspaceId },
        _count: { _all: true },
        _sum: { sizeBytes: true },
      }),
      this.prisma.document.count({
        where: { workspaceId, createdAt: { gte: monthStart } },
      }),
      this.prisma.document.count({
        where: { workspaceId, caseId: null, clientId: null },
      }),
    ]);

    return {
      total: aggregate._count._all,
      totalSizeBytes: aggregate._sum.sizeBytes ?? 0,
      uploadedThisMonth,
      unlinkedCount,
    };
  }

  async facets(workspaceId: string) {
    const [categories, cases, clients] = await Promise.all([
      this.prisma.document.groupBy({
        by: ['category'],
        where: { workspaceId },
        _count: { _all: true },
      }),
      this.prisma.document.groupBy({
        by: ['caseId'],
        where: { workspaceId, caseId: { not: null } },
        _count: { _all: true },
      }),
      this.prisma.document.groupBy({
        by: ['clientId'],
        where: { workspaceId, clientId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const caseIds = cases
      .map((row) => row.caseId)
      .filter((id): id is string => Boolean(id));
    const clientIds = clients
      .map((row) => row.clientId)
      .filter((id): id is string => Boolean(id));

    const [caseRows, clientRows] = await Promise.all([
      caseIds.length
        ? this.prisma.case.findMany({
            where: { id: { in: caseIds }, workspaceId },
            select: { id: true, title: true, caseNumber: true },
          })
        : Promise.resolve([]),
      clientIds.length
        ? this.prisma.client.findMany({
            where: { id: { in: clientIds }, workspaceId },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
    ]);

    return { categories, cases, clients, caseRows, clientRows };
  }

  /** Confirms a case belongs to the workspace before linking. */
  async caseExists(workspaceId: string, caseId: string): Promise<boolean> {
    const found = await this.prisma.case.findFirst({
      where: { id: caseId, workspaceId },
      select: { id: true },
    });
    return Boolean(found);
  }

  async clientExists(workspaceId: string, clientId: string): Promise<boolean> {
    const found = await this.prisma.client.findFirst({
      where: { id: clientId, workspaceId },
      select: { id: true },
    });
    return Boolean(found);
  }
}

function buildWhere(
  workspaceId: string,
  query: ListDocumentsQuery,
): Prisma.DocumentWhereInput {
  const where: Prisma.DocumentWhereInput = { workspaceId };

  if (query.category) {
    where.category = query.category;
  }

  if (query.caseId) {
    where.caseId = query.caseId;
  }

  if (query.clientId) {
    where.clientId = query.clientId;
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { fileName: { contains: query.search, mode: 'insensitive' } },
      { case: { title: { contains: query.search, mode: 'insensitive' } } },
      { case: { caseNumber: { contains: query.search, mode: 'insensitive' } } },
      { client: { name: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  return where;
}
