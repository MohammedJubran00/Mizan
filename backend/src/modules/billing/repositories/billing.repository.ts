import type { InvoiceStatus, Prisma, PrismaClient } from '@prisma/client';
import type { ListInvoicesQuery } from '../dto/billing.dto';

const invoiceInclude = {
  client: { select: { id: true, name: true, email: true } },
  case: { select: { id: true, title: true, caseNumber: true } },
  billingLawyer: { select: { id: true, fullName: true, email: true } },
  items: { orderBy: { sortOrder: 'asc' as const } },
  billing: { select: { id: true, status: true, paymentMethod: true, occurredAt: true } },
} satisfies Prisma.InvoiceInclude;

export type InvoiceRow = Prisma.InvoiceGetPayload<{ include: typeof invoiceInclude }>;

export class BillingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ─── Invoices ───────────────────────────────────────────────────────────
  async findManyInvoices(workspaceId: string, query: ListInvoicesQuery): Promise<{ rows: InvoiceRow[]; total: number }> {
    const where: Prisma.InvoiceWhereInput = { workspaceId };
    if (query.clientId) where.clientId = query.clientId;
    if (query.caseId) where.caseId = query.caseId;
    if (query.status && query.status !== 'ALL') where.status = query.status as InvoiceStatus;
    if (query.from || query.to) {
      where.issuedAt = {};
      if (query.from) where.issuedAt.gte = query.from;
      if (query.to) where.issuedAt.lte = query.to;
    }
    if (query.search) {
      where.OR = [
        { number: { contains: query.search, mode: 'insensitive' } },
        { client: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: invoiceInclude,
        orderBy: { [query.sortBy]: query.sortDir },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { rows, total };
  }

  async findInvoiceById(workspaceId: string, id: string): Promise<InvoiceRow | null> {
    return this.prisma.invoice.findFirst({ where: { id, workspaceId }, include: invoiceInclude });
  }

  async createInvoice(data: Prisma.InvoiceCreateInput): Promise<InvoiceRow> {
    return this.prisma.invoice.create({ data, include: invoiceInclude });
  }

  async updateInvoice(workspaceId: string, id: string, data: Prisma.InvoiceUpdateInput): Promise<InvoiceRow | null> {
    const existing = await this.prisma.invoice.findFirst({ where: { id, workspaceId }, select: { id: true } });
    if (!existing) return null;
    return this.prisma.invoice.update({ where: { id }, data, include: invoiceInclude });
  }

  async deleteInvoice(workspaceId: string, id: string): Promise<boolean> {
    const existing = await this.prisma.invoice.findFirst({ where: { id, workspaceId }, select: { id: true } });
    if (!existing) return false;
    await this.prisma.invoice.delete({ where: { id } });
    return true;
  }

  async countInvoicesInWorkspace(workspaceId: string): Promise<number> {
    return this.prisma.invoice.count({ where: { workspaceId } });
  }

  // ─── Billings (Payments) ────────────────────────────────────────────────
  async createBilling(data: Prisma.BillingCreateInput) {
    return this.prisma.billing.create({ data });
  }

  async findManyBillings(workspaceId: string, query: { page: number; pageSize: number; clientId?: string; caseId?: string }) {
    const where: Prisma.BillingWhereInput = { workspaceId };
    if (query.clientId) where.clientId = query.clientId;
    if (query.caseId) where.caseId = query.caseId;
    const [rows, total] = await Promise.all([
      this.prisma.billing.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.billing.count({ where }),
    ]);
    return { rows, total };
  }

  // ─── Manual Revenue ─────────────────────────────────────────────────────
  async createManualRevenue(data: Prisma.ManualRevenueCreateInput) {
    return this.prisma.manualRevenue.create({ data });
  }

  async findManyManualRevenues(workspaceId: string, query: { page: number; pageSize: number }) {
    const [rows, total] = await Promise.all([
      this.prisma.manualRevenue.findMany({
        where: { workspaceId },
        orderBy: { occurredAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.manualRevenue.count({ where: { workspaceId } }),
    ]);
    return { rows, total };
  }

  // ─── Billable Hours ──────────────────────────────────────────────────────
  async createBillableHour(data: Prisma.BillableHourEntryCreateInput) {
    return this.prisma.billableHourEntry.create({ data });
  }

  async findManyBillableHours(workspaceId: string, query: { page: number; pageSize: number; caseId?: string }) {
    const where: Prisma.BillableHourEntryWhereInput = { workspaceId };
    if (query.caseId) where.caseId = query.caseId;
    const [rows, total] = await Promise.all([
      this.prisma.billableHourEntry.findMany({
        where,
        orderBy: { workedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.billableHourEntry.count({ where }),
    ]);
    return { rows, total };
  }

  async updateBillableHour(workspaceId: string, id: string, data: Prisma.BillableHourEntryUpdateInput) {
    const existing = await this.prisma.billableHourEntry.findFirst({ where: { id, workspaceId }, select: { id: true } });
    if (!existing) return null;
    return this.prisma.billableHourEntry.update({ where: { id }, data });
  }

  async deleteBillableHour(workspaceId: string, id: string): Promise<boolean> {
    const existing = await this.prisma.billableHourEntry.findFirst({ where: { id, workspaceId }, select: { id: true } });
    if (!existing) return false;
    await this.prisma.billableHourEntry.delete({ where: { id } });
    return true;
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  async summary(workspaceId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalRevenue, outstanding, overdueAgg, paymentsThisMonth, invoicesByStatus] =
      await Promise.all([
        this.prisma.billing.aggregate({
          where: { workspaceId, status: 'POSTED' },
          _sum: { amount: true },
        }),
        this.prisma.invoice.aggregate({
          where: { workspaceId, status: { in: ['SENT', 'OVERDUE'] } },
          _sum: { amount: true },
          _count: { id: true },
        }),
        this.prisma.invoice.aggregate({
          where: { workspaceId, status: 'OVERDUE' },
          _count: { id: true },
        }),
        this.prisma.billing.aggregate({
          where: {
            workspaceId,
            status: 'POSTED',
            occurredAt: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),
        this.prisma.invoice.groupBy({
          by: ['status'],
          where: { workspaceId },
          _count: { id: true },
          _sum: { amount: true },
        }),
      ]);

    const statusCounts = Object.fromEntries(
      invoicesByStatus.map((row) => [row.status, row._count.id]),
    ) as Record<string, number>;

    const paidInvoiceCount = statusCounts.PAID ?? 0;
    const overdueInvoiceCount = statusCounts.OVERDUE ?? overdueAgg._count.id ?? 0;
    const issuedInvoiceCount = invoicesByStatus.reduce((sum, row) => sum + row._count.id, 0);
    const paidProgress =
      issuedInvoiceCount === 0 ? 0 : (paidInvoiceCount / issuedInvoiceCount) * 100;

    return {
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
      outstandingBalance: Number(outstanding._sum.amount ?? 0),
      outstanding: Number(outstanding._sum.amount ?? 0),
      paidInvoiceCount,
      overdueInvoiceCount,
      paymentsThisMonth: Number(paymentsThisMonth._sum.amount ?? 0),
      currency: 'USD',
      urgentOutstandingCount: overdueInvoiceCount,
      paidProgress: Math.round(paidProgress * 10) / 10,
      invoicesByStatus: invoicesByStatus.map((r) => ({
        status: r.status,
        count: r._count.id,
        total: Number(r._sum.amount ?? 0),
      })),
    };
  }
}
