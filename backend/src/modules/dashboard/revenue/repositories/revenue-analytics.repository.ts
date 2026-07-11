import type { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';

import type { PeriodBounds } from '../../../../shared/utils/timezone';
import type { RevenueQueryFilter } from '../filters/revenue-filter';

export interface MonthlyTrendRow {
  year: number;
  month: number;
  revenue: number;
  invoiceCount: number;
  paymentCount: number;
}

export interface NamedAmountRow {
  id: string;
  name: string;
  amount: number;
  meta?: Record<string, string | number | null>;
}

export interface CategoryAmountRow {
  category: string;
  amount: number;
}

export interface CurrencyAmountRow {
  currency: string;
  amount: number;
}

export interface InvoiceStatusAmountRow {
  status: string;
  amount: number;
  count: number;
}

export interface PaymentDelayRow {
  avgDelayDays: number;
}

/**
 * Optimized revenue analytics queries — Billing is the source of truth for paid revenue.
 * Filters are applied in SQL whenever possible.
 */
export class RevenueAnalyticsRepository {
  constructor(private readonly db: PrismaClient) {}

  async getWorkspaceCurrency(workspaceId: string): Promise<string> {
    const workspace = await this.db.workspace.findUnique({
      where: { id: workspaceId },
      select: { defaultCurrency: true },
    });
    return workspace?.defaultCurrency ?? 'USD';
  }

  async sumPostedBilling(
    filter: RevenueQueryFilter,
    period?: PeriodBounds,
  ): Promise<number> {
    const rows = await this.db.$queryRawUnsafe<Array<{ amount: Prisma.Decimal }>>(
      `SELECT COALESCE(SUM(b."amount"), 0) AS amount
       FROM "billings" b
       ${this.joinCases(filter)}
       WHERE ${this.billingWhereSql(filter, period, 'POSTED')}`,
      ...this.billingWhereParams(filter, period),
    );
    return Number(rows[0]?.amount ?? 0);
  }

  async sumBillingByStatus(
    filter: RevenueQueryFilter,
    status: 'POSTED' | 'PENDING' | 'CANCELLED' | 'REFUNDED',
  ): Promise<number> {
    const rows = await this.db.$queryRawUnsafe<Array<{ amount: Prisma.Decimal }>>(
      `SELECT COALESCE(SUM(b."amount"), 0) AS amount
       FROM "billings" b
       ${this.joinCases(filter)}
       WHERE ${this.billingWhereSql(filter, undefined, status)}`,
      ...this.billingWhereParams(filter),
    );
    return Number(rows[0]?.amount ?? 0);
  }

  async sumBySource(
    filter: RevenueQueryFilter,
    source: 'INVOICE' | 'MANUAL' | 'PROVIDER',
  ): Promise<number> {
    const params = [...this.billingWhereParams(filter), source];
    const rows = await this.db.$queryRawUnsafe<Array<{ amount: Prisma.Decimal }>>(
      `SELECT COALESCE(SUM(b."amount"), 0) AS amount
       FROM "billings" b
       ${this.joinCases(filter)}
       WHERE ${this.billingWhereSql(filter, undefined, 'POSTED')}
         AND b."source" = $${params.length}::"BillingSource"`,
      ...params,
    );
    return Number(rows[0]?.amount ?? 0);
  }

  async groupByCategory(filter: RevenueQueryFilter): Promise<CategoryAmountRow[]> {
    const rows = await this.db.$queryRawUnsafe<
      Array<{ category: string; amount: Prisma.Decimal }>
    >(
      `SELECT b."category"::text AS category,
              COALESCE(SUM(b."amount"), 0) AS amount
       FROM "billings" b
       ${this.joinCases(filter)}
       WHERE ${this.billingWhereSql(filter, undefined, 'POSTED')}
       GROUP BY b."category"
       ORDER BY amount DESC`,
      ...this.billingWhereParams(filter),
    );

    return rows.map((row) => ({
      category: row.category,
      amount: Number(row.amount),
    }));
  }

  async listCurrencies(filter: RevenueQueryFilter): Promise<string[]> {
    const rows = await this.db.$queryRawUnsafe<Array<{ currency: string }>>(
      `SELECT DISTINCT b."currency" AS currency
       FROM "billings" b
       ${this.joinCases(filter)}
       WHERE ${this.billingWhereSql(filter, undefined, 'POSTED')}
       ORDER BY currency ASC`,
      ...this.billingWhereParams(filter),
    );
    return rows.map((row) => row.currency);
  }

  async monthlyTrend(
    filter: RevenueQueryFilter,
    since: Date,
    months: number,
  ): Promise<MonthlyTrendRow[]> {
    const baseParams = this.billingWhereParams(filter);
    const params = [...baseParams, since];
    const sinceIdx = params.length;

    const rows = await this.db.$queryRawUnsafe<
      Array<{
        year: number;
        month: number;
        revenue: Prisma.Decimal;
        invoice_count: bigint;
        payment_count: bigint;
      }>
    >(
      `SELECT
          EXTRACT(YEAR FROM b."occurredAt")::int AS year,
          EXTRACT(MONTH FROM b."occurredAt")::int AS month,
          COALESCE(SUM(b."amount"), 0) AS revenue,
          COUNT(*) FILTER (WHERE b."source" = 'INVOICE')::bigint AS invoice_count,
          COUNT(*)::bigint AS payment_count
       FROM "billings" b
       ${this.joinCases(filter)}
       WHERE ${this.billingWhereSql(filter, undefined, 'POSTED')}
         AND b."occurredAt" >= $${sinceIdx}
       GROUP BY 1, 2
       ORDER BY 1 ASC, 2 ASC`,
      ...params,
    );

    return fillMonthlySeries(months, since, rows);
  }

  async topClients(filter: RevenueQueryFilter, limit: number): Promise<NamedAmountRow[]> {
    const params = [...this.billingWhereParams(filter), limit];
    const rows = await this.db.$queryRawUnsafe<
      Array<{ id: string; name: string; amount: Prisma.Decimal }>
    >(
      `SELECT cl."id" AS id, cl."name" AS name, COALESCE(SUM(b."amount"), 0) AS amount
       FROM "billings" b
       INNER JOIN "clients" cl ON cl."id" = b."clientId"
       ${this.joinCases(filter, false)}
       WHERE ${this.billingWhereSql(filter, undefined, 'POSTED')}
         AND b."clientId" IS NOT NULL
       GROUP BY cl."id", cl."name"
       ORDER BY amount DESC
       LIMIT $${params.length}`,
      ...params,
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      amount: Number(row.amount),
    }));
  }

  async topPracticeAreas(
    filter: RevenueQueryFilter,
    limit: number,
  ): Promise<NamedAmountRow[]> {
    const params = [...this.billingWhereParams(filter), limit];
    const rows = await this.db.$queryRawUnsafe<
      Array<{ name: string; amount: Prisma.Decimal }>
    >(
      `SELECT COALESCE(NULLIF(TRIM(c."practiceArea"), ''), 'Other') AS name,
              COALESCE(SUM(b."amount"), 0) AS amount
       FROM "billings" b
       INNER JOIN "cases" c ON c."id" = b."caseId"
       WHERE ${this.billingWhereSql(filter, undefined, 'POSTED')}
         AND b."caseId" IS NOT NULL
       GROUP BY 1
       ORDER BY amount DESC
       LIMIT $${params.length}`,
      ...params,
    );
    return rows.map((row, index) => ({
      id: `practice-${index}-${row.name}`,
      name: row.name,
      amount: Number(row.amount),
    }));
  }

  async topLawyers(filter: RevenueQueryFilter, limit: number): Promise<NamedAmountRow[]> {
    const params = [...this.billingWhereParams(filter), limit];
    const rows = await this.db.$queryRawUnsafe<
      Array<{ id: string; name: string; amount: Prisma.Decimal }>
    >(
      `SELECT u."id" AS id, u."fullName" AS name, COALESCE(SUM(b."amount"), 0) AS amount
       FROM "billings" b
       INNER JOIN "users" u ON u."id" = b."lawyerUserId"
       ${this.joinCases(filter, false)}
       WHERE ${this.billingWhereSql(filter, undefined, 'POSTED')}
         AND b."lawyerUserId" IS NOT NULL
       GROUP BY u."id", u."fullName"
       ORDER BY amount DESC
       LIMIT $${params.length}`,
      ...params,
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      amount: Number(row.amount),
    }));
  }

  async highestRevenueCases(
    filter: RevenueQueryFilter,
    limit: number,
  ): Promise<NamedAmountRow[]> {
    const params = [...this.billingWhereParams(filter), limit];
    const rows = await this.db.$queryRawUnsafe<
      Array<{ id: string; name: string; amount: Prisma.Decimal; practice: string | null }>
    >(
      `SELECT c."id" AS id, c."title" AS name,
              COALESCE(SUM(b."amount"), 0) AS amount,
              c."practiceArea" AS practice
       FROM "billings" b
       INNER JOIN "cases" c ON c."id" = b."caseId"
       WHERE ${this.billingWhereSql(filter, undefined, 'POSTED')}
         AND b."caseId" IS NOT NULL
       GROUP BY c."id", c."title", c."practiceArea"
       ORDER BY amount DESC
       LIMIT $${params.length}`,
      ...params,
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      amount: Number(row.amount),
      meta: { practiceArea: row.practice },
    }));
  }

  async largestInvoices(
    filter: RevenueQueryFilter,
    limit: number,
  ): Promise<NamedAmountRow[]> {
    const params = [...this.invoiceWhereParams(filter), limit];
    const rows = await this.db.$queryRawUnsafe<
      Array<{ id: string; amount: Prisma.Decimal; status: string; currency: string }>
    >(
      `SELECT i."id" AS id, i."amount" AS amount, i."status"::text AS status, i."currency" AS currency
       FROM "invoices" i
       ${this.joinInvoiceCases(filter)}
       WHERE ${this.invoiceWhereSql(filter)}
       ORDER BY i."amount" DESC
       LIMIT $${params.length}`,
      ...params,
    );
    return rows.map((row) => ({
      id: row.id,
      name: `Invoice ${row.id.slice(0, 8)}`,
      amount: Number(row.amount),
      meta: { status: row.status, currency: row.currency },
    }));
  }

  async invoiceStatusTotals(
    filter: RevenueQueryFilter,
  ): Promise<InvoiceStatusAmountRow[]> {
    const rows = await this.db.$queryRawUnsafe<
      Array<{ status: string; amount: Prisma.Decimal; count: bigint }>
    >(
      `SELECT i."status"::text AS status,
              COALESCE(SUM(i."amount"), 0) AS amount,
              COUNT(*)::bigint AS count
       FROM "invoices" i
       ${this.joinInvoiceCases(filter)}
       WHERE ${this.invoiceWhereSql(filter)}
       GROUP BY i."status"`,
      ...this.invoiceWhereParams(filter),
    );

    return rows.map((row) => ({
      status: row.status,
      amount: Number(row.amount),
      count: Number(row.count),
    }));
  }

  async countDistinctClientsWithRevenue(filter: RevenueQueryFilter): Promise<number> {
    const rows = await this.db.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(DISTINCT b."clientId")::bigint AS count
       FROM "billings" b
       ${this.joinCases(filter)}
       WHERE ${this.billingWhereSql(filter, undefined, 'POSTED')}
         AND b."clientId" IS NOT NULL`,
      ...this.billingWhereParams(filter),
    );
    return Number(rows[0]?.count ?? 0);
  }

  async countDistinctCasesWithRevenue(filter: RevenueQueryFilter): Promise<number> {
    const rows = await this.db.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(DISTINCT b."caseId")::bigint AS count
       FROM "billings" b
       ${this.joinCases(filter)}
       WHERE ${this.billingWhereSql(filter, undefined, 'POSTED')}
         AND b."caseId" IS NOT NULL`,
      ...this.billingWhereParams(filter),
    );
    return Number(rows[0]?.count ?? 0);
  }

  async countLawyersWithRevenue(filter: RevenueQueryFilter): Promise<number> {
    const rows = await this.db.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(DISTINCT b."lawyerUserId")::bigint AS count
       FROM "billings" b
       ${this.joinCases(filter)}
       WHERE ${this.billingWhereSql(filter, undefined, 'POSTED')}
         AND b."lawyerUserId" IS NOT NULL`,
      ...this.billingWhereParams(filter),
    );
    return Number(rows[0]?.count ?? 0);
  }

  async averagePaymentDelayDays(filter: RevenueQueryFilter): Promise<number> {
    const rows = await this.db.$queryRawUnsafe<PaymentDelayRow[]>(
      `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (i."paidAt" - i."issuedAt")) / 86400.0), 0) AS "avgDelayDays"
       FROM "invoices" i
       ${this.joinInvoiceCases(filter)}
       WHERE ${this.invoiceWhereSql(filter)}
         AND i."status" = 'PAID'
         AND i."paidAt" IS NOT NULL`,
      ...this.invoiceWhereParams(filter),
    );
    return Number(rows[0]?.avgDelayDays ?? 0);
  }

  async countPostedPayments(filter: RevenueQueryFilter): Promise<number> {
    const rows = await this.db.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*)::bigint AS count
       FROM "billings" b
       ${this.joinCases(filter)}
       WHERE ${this.billingWhereSql(filter, undefined, 'POSTED')}`,
      ...this.billingWhereParams(filter),
    );
    return Number(rows[0]?.count ?? 0);
  }

  private joinCases(filter: RevenueQueryFilter, includeAlias = true): string {
    const practice = filter.practiceArea ?? filter.caseType;
    if (!practice && !filter.lawyerId) {
      return '';
    }
    // Always left-join cases when practice/lawyer filters need case attributes
    // beyond denormalized billing columns.
    if (practice) {
      return 'LEFT JOIN "cases" c ON c."id" = b."caseId"';
    }
    return includeAlias ? '' : '';
  }

  private joinInvoiceCases(filter: RevenueQueryFilter): string {
    const practice = filter.practiceArea ?? filter.caseType;
    if (!practice && !filter.lawyerId) {
      return '';
    }
    return 'LEFT JOIN "cases" c ON c."id" = i."caseId"';
  }

  private billingWhereSql(
    filter: RevenueQueryFilter,
    period?: PeriodBounds,
    status: 'POSTED' | 'PENDING' | 'CANCELLED' | 'REFUNDED' | null = 'POSTED',
  ): string {
    const clauses: string[] = ['b."workspaceId" = $1'];
    let idx = 2;

    if (status) {
      clauses.push(`b."status" = $${idx}::"BillingStatus"`);
      idx += 1;
    }
    if (period) {
      clauses.push(`b."occurredAt" >= $${idx}`);
      idx += 1;
      clauses.push(`b."occurredAt" < $${idx}`);
      idx += 1;
    }
    if (filter.dateFrom) {
      clauses.push(`b."occurredAt" >= $${idx}`);
      idx += 1;
    }
    if (filter.dateTo) {
      clauses.push(`b."occurredAt" < $${idx}`);
      idx += 1;
    }
    if (filter.clientId) {
      clauses.push(`b."clientId" = $${idx}`);
      idx += 1;
    }
    if (filter.lawyerId) {
      clauses.push(`b."lawyerUserId" = $${idx}`);
      idx += 1;
    }
    if (filter.currency) {
      clauses.push(`b."currency" = $${idx}`);
      idx += 1;
    }
    if (filter.source) {
      clauses.push(`b."source" = $${idx}::"BillingSource"`);
      idx += 1;
    }
    if (filter.category) {
      clauses.push(`b."category" = $${idx}::"RevenueCategory"`);
      idx += 1;
    }
    if (filter.status && status === null) {
      clauses.push(`b."status" = $${idx}::"BillingStatus"`);
      idx += 1;
    }
    const practice = filter.practiceArea ?? filter.caseType;
    if (practice) {
      clauses.push(`COALESCE(NULLIF(TRIM(c."practiceArea"), ''), 'Other') = $${idx}`);
      idx += 1;
    }

    void idx;
    return clauses.join(' AND ');
  }

  private billingWhereParams(
    filter: RevenueQueryFilter,
    period?: PeriodBounds,
    status: 'POSTED' | 'PENDING' | 'CANCELLED' | 'REFUNDED' | null = 'POSTED',
  ): unknown[] {
    const params: unknown[] = [filter.workspaceId];
    if (status) {
      params.push(status);
    }
    if (period) {
      params.push(period.start, period.end);
    }
    if (filter.dateFrom) {
      params.push(filter.dateFrom);
    }
    if (filter.dateTo) {
      params.push(filter.dateTo);
    }
    if (filter.clientId) {
      params.push(filter.clientId);
    }
    if (filter.lawyerId) {
      params.push(filter.lawyerId);
    }
    if (filter.currency) {
      params.push(filter.currency);
    }
    if (filter.source) {
      params.push(filter.source);
    }
    if (filter.category) {
      params.push(filter.category);
    }
    if (filter.status && status === null) {
      params.push(filter.status);
    }
    const practice = filter.practiceArea ?? filter.caseType;
    if (practice) {
      params.push(practice);
    }
    return params;
  }

  private invoiceWhereSql(filter: RevenueQueryFilter): string {
    const clauses: string[] = ['i."workspaceId" = $1'];
    let idx = 2;
    if (filter.dateFrom) {
      clauses.push(`COALESCE(i."paidAt", i."issuedAt") >= $${idx}`);
      idx += 1;
    }
    if (filter.dateTo) {
      clauses.push(`COALESCE(i."paidAt", i."issuedAt") < $${idx}`);
      idx += 1;
    }
    if (filter.clientId) {
      clauses.push(`i."clientId" = $${idx}`);
      idx += 1;
    }
    if (filter.lawyerId) {
      clauses.push(`c."assignedToUserId" = $${idx}`);
      idx += 1;
    }
    if (filter.currency) {
      clauses.push(`i."currency" = $${idx}`);
      idx += 1;
    }
    const practice = filter.practiceArea ?? filter.caseType;
    if (practice) {
      clauses.push(`COALESCE(NULLIF(TRIM(c."practiceArea"), ''), 'Other') = $${idx}`);
      idx += 1;
    }
    void idx;
    return clauses.join(' AND ');
  }

  private invoiceWhereParams(filter: RevenueQueryFilter): unknown[] {
    const params: unknown[] = [filter.workspaceId];
    if (filter.dateFrom) {
      params.push(filter.dateFrom);
    }
    if (filter.dateTo) {
      params.push(filter.dateTo);
    }
    if (filter.clientId) {
      params.push(filter.clientId);
    }
    if (filter.lawyerId) {
      params.push(filter.lawyerId);
    }
    if (filter.currency) {
      params.push(filter.currency);
    }
    const practice = filter.practiceArea ?? filter.caseType;
    if (practice) {
      params.push(practice);
    }
    return params;
  }
}

function fillMonthlySeries(
  months: number,
  since: Date,
  rows: Array<{
    year: number;
    month: number;
    revenue: Prisma.Decimal;
    invoice_count: bigint;
    payment_count: bigint;
  }>,
): MonthlyTrendRow[] {
  const map = new Map<string, MonthlyTrendRow>();
  for (const row of rows) {
    const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
    map.set(key, {
      year: row.year,
      month: row.month,
      revenue: Number(row.revenue),
      invoiceCount: Number(row.invoice_count),
      paymentCount: Number(row.payment_count),
    });
  }

  const series: MonthlyTrendRow[] = [];
  const cursor = new Date(Date.UTC(since.getUTCFullYear(), since.getUTCMonth(), 1));

  for (let i = 0; i < months; i += 1) {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    series.push(
      map.get(key) ?? {
        year,
        month,
        revenue: 0,
        invoiceCount: 0,
        paymentCount: 0,
      },
    );
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return series;
}
