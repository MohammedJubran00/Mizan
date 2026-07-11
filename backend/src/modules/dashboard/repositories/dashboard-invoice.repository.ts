import type { InvoiceStatus, PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface RevenueMonthAggregate {
  month: string;
  amount: number;
}

export class DashboardInvoiceRepository {
  constructor(private readonly db: PrismaClient) {}

  async countInvoices(workspaceId: string): Promise<number> {
    return this.db.invoice.count({ where: { workspaceId } });
  }

  async countPaidInvoices(workspaceId: string): Promise<number> {
    return this.db.invoice.count({
      where: { workspaceId, status: 'PAID' },
    });
  }

  async calculateRevenue(workspaceId: string, status: InvoiceStatus): Promise<number> {
    const result = await this.db.invoice.aggregate({
      where: { workspaceId, status },
      _sum: { amount: true },
    });

    return decimalToNumber(result._sum.amount);
  }

  async calculatePaidRevenue(workspaceId: string): Promise<number> {
    return this.calculateRevenue(workspaceId, 'PAID');
  }

  async calculateOutstandingRevenue(workspaceId: string): Promise<number> {
    const result = await this.db.invoice.aggregate({
      where: {
        workspaceId,
        status: { in: ['SENT', 'OVERDUE'] },
      },
      _sum: { amount: true },
    });

    return decimalToNumber(result._sum.amount);
  }

  async calculateDraftRevenue(workspaceId: string): Promise<number> {
    return this.calculateRevenue(workspaceId, 'DRAFT');
  }

  /**
   * Monthly paid revenue for the last `months` calendar months (inclusive of current).
   * Aggregation runs in PostgreSQL via date_trunc.
   */
  async calculatePaidRevenueByMonth(
    workspaceId: string,
    months: number,
  ): Promise<RevenueMonthAggregate[]> {
    const since = startOfMonthOffset(months - 1);

    const rows = await this.db.$queryRaw<Array<{ month: Date; amount: Prisma.Decimal }>>`
      SELECT date_trunc('month', "paidAt") AS month,
             COALESCE(SUM("amount"), 0) AS amount
      FROM "invoices"
      WHERE "workspaceId" = ${workspaceId}
        AND "status" = 'PAID'
        AND "paidAt" IS NOT NULL
        AND "paidAt" >= ${since}
      GROUP BY date_trunc('month', "paidAt")
      ORDER BY month ASC
    `;

    return fillMonthSeries(months, rows);
  }
}

function decimalToNumber(value: Prisma.Decimal | null | undefined): number {
  if (value == null) {
    return 0;
  }
  return Number(value);
}

function startOfMonthOffset(monthsBack: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1));
}

function fillMonthSeries(
  months: number,
  rows: Array<{ month: Date; amount: Prisma.Decimal }>,
): RevenueMonthAggregate[] {
  const map = new Map<string, number>();

  for (const row of rows) {
    const key = toMonthKey(new Date(row.month));
    map.set(key, Number(row.amount));
  }

  const series: RevenueMonthAggregate[] = [];
  const cursor = startOfMonthOffset(months - 1);

  for (let i = 0; i < months; i += 1) {
    const key = toMonthKey(cursor);
    series.push({
      month: key,
      amount: map.get(key) ?? 0,
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return series;
}

function toMonthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
