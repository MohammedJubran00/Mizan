import { calculateGrowthPercent, round2, safeDivide, toPercentageDistribution } from '../../../../shared/utils/math';
import type { WorkspacePeriods } from '../../../../shared/utils/timezone';
import type {
  FinancialKpisDto,
  MonthlyRevenueDto,
  RevenueChartsDto,
  RevenueDashboardDto,
  RevenueFilterSnapshotDto,
  RevenueSourceDto,
  RevenueSummaryDto,
  TopRevenueSourcesDto,
} from '../dto/revenue-analytics.dto';
import type { RevenueFilterInput, RevenueQueryFilter } from '../filters/revenue-filter';
import type { RevenueAnalyticsRepository } from '../repositories/revenue-analytics.repository';
import { buildGrowthMetric } from '../utils/growth';

const CATEGORY_LABELS: Record<string, string> = {
  INVOICE_PAYMENT: 'Invoice Revenue',
  MANUAL: 'Manual Revenue',
  CONSULTATION: 'Consultations',
  COURT_FEE: 'Court Fees',
  RETAINER: 'Retainers',
  SUBSCRIPTION: 'Subscriptions',
  OTHER: 'Other Categories',
};

export interface RevenueAnalyticsContext {
  workspaceId: string;
  timezone: string;
  periods: WorkspacePeriods;
  filter: RevenueFilterInput;
  now?: Date;
  trendMonths?: number;
}

/**
 * Production revenue analytics engine.
 * All paid revenue is read from Billing — the single financial source of truth.
 */
export class RevenueAnalyticsService {
  constructor(private readonly repository: RevenueAnalyticsRepository) {}

  async calculate(context: RevenueAnalyticsContext): Promise<RevenueDashboardDto> {
    const filter: RevenueQueryFilter = {
      ...context.filter,
      workspaceId: context.workspaceId,
    };
    const periods = context.periods;
    const trendMonths = context.trendMonths ?? 12;
    const topLimit = filter.topLimit ?? 5;

    const since = startOfMonthOffset(trendMonths - 1);

    const [
      defaultCurrency,
      today,
      yesterday,
      thisWeek,
      lastWeek,
      thisMonth,
      lastMonth,
      thisQuarter,
      lastQuarter,
      thisYear,
      lastYear,
      lifetime,
      refunded,
      cancelledBilling,
      fromInvoices,
      fromManual,
      categoryRows,
      currencies,
      monthlyRows,
      invoiceStatusRows,
      topClients,
      topPracticeAreas,
      topLawyers,
      highestCases,
      largestInvoices,
      clientsWithRevenue,
      casesWithRevenue,
      lawyersWithRevenue,
      avgDelay,
      paymentCount,
    ] = await Promise.all([
      this.repository.getWorkspaceCurrency(context.workspaceId),
      this.repository.sumPostedBilling(filter, periods.today),
      this.repository.sumPostedBilling(filter, periods.yesterday),
      this.repository.sumPostedBilling(filter, periods.thisWeek),
      this.repository.sumPostedBilling(filter, periods.lastWeek),
      this.repository.sumPostedBilling(filter, periods.thisMonth),
      this.repository.sumPostedBilling(filter, periods.lastMonth),
      this.repository.sumPostedBilling(filter, periods.thisQuarter),
      this.repository.sumPostedBilling(filter, periods.lastQuarter),
      this.repository.sumPostedBilling(filter, periods.thisYear),
      this.repository.sumPostedBilling(filter, periods.lastYear),
      this.repository.sumPostedBilling(filter),
      this.repository.sumBillingByStatus(filter, 'REFUNDED'),
      this.repository.sumBillingByStatus(filter, 'CANCELLED'),
      this.repository.sumBySource(filter, 'INVOICE'),
      this.repository.sumBySource(filter, 'MANUAL'),
      this.repository.groupByCategory(filter),
      this.repository.listCurrencies(filter),
      this.repository.monthlyTrend(filter, since, trendMonths),
      this.repository.invoiceStatusTotals(filter),
      this.repository.topClients(filter, topLimit),
      this.repository.topPracticeAreas(filter, topLimit),
      this.repository.topLawyers(filter, topLimit),
      this.repository.highestRevenueCases(filter, topLimit),
      this.repository.largestInvoices(filter, topLimit),
      this.repository.countDistinctClientsWithRevenue(filter),
      this.repository.countDistinctCasesWithRevenue(filter),
      this.repository.countLawyersWithRevenue(filter),
      this.repository.averagePaymentDelayDays(filter),
      this.repository.countPostedPayments(filter),
    ]);

    const currency = filter.currency ?? defaultCurrency;
    const invoiceMap = Object.fromEntries(
      invoiceStatusRows.map((row) => [row.status, row]),
    );

    const outstanding =
      (invoiceMap.SENT?.amount ?? 0) + (invoiceMap.OVERDUE?.amount ?? 0);
    const pending = invoiceMap.DRAFT?.amount ?? 0;
    const cancelledInvoices = invoiceMap.CANCELLED?.amount ?? 0;
    const refundedInvoices = invoiceMap.REFUNDED?.amount ?? 0;
    const draft = pending;
    const paidInvoiceCount = invoiceMap.PAID?.count ?? 0;
    const totalInvoiceCount = invoiceStatusRows.reduce((sum, row) => sum + row.count, 0);
    const cancelled = cancelledBilling + cancelledInvoices;
    const refundedTotal = refunded + refundedInvoices;

    const summary: RevenueSummaryDto = {
      today,
      yesterday,
      thisWeek,
      lastWeek,
      thisMonth,
      lastMonth,
      thisQuarter,
      lastQuarter,
      thisYear,
      lastYear,
      lifetime,
      outstanding,
      paid: lifetime,
      pending,
      cancelled,
      refunded: refundedTotal,
      invoiceCount: totalInvoiceCount,
      paidInvoiceCount,
      currency,
      currencies: currencies.length > 0 ? currencies : [currency],
    };

    const trendMonthsDto: MonthlyRevenueDto[] = monthlyRows.map((row, index) => {
      const previous = index > 0 ? monthlyRows[index - 1]?.revenue ?? 0 : 0;
      return {
        month: row.month,
        year: row.year,
        label: `${row.year}-${String(row.month).padStart(2, '0')}`,
        revenue: row.revenue,
        growth: calculateGrowthPercent(row.revenue, previous),
        invoiceCount: row.invoiceCount,
        paymentCount: row.paymentCount,
        currency,
      };
    });

    const comparisons = {
      weekOverWeek: buildGrowthMetric(thisWeek, lastWeek),
      monthOverMonth: buildGrowthMetric(thisMonth, lastMonth),
      quarterOverQuarter: buildGrowthMetric(thisQuarter, lastQuarter),
      yearOverYear: buildGrowthMetric(thisYear, lastYear),
      lifetimeGrowth: buildGrowthMetric(lifetime, lastYear),
    };

    const categoryDistribution = toPercentageDistribution(
      categoryRows.map((row) => ({
        label: row.category,
        value: row.amount,
      })),
    );

    const breakdownItems: RevenueSourceDto[] = categoryDistribution.map((item) => ({
      key: item.label,
      label: CATEGORY_LABELS[item.label] ?? item.label,
      amount: item.value,
      percentage: item.percentage,
      currency,
    }));

    // Ensure extensible category slots appear with zero when empty total — only when data exists.
    const breakdownTotal = breakdownItems.reduce((sum, item) => sum + item.amount, 0);

    const topSources: TopRevenueSourcesDto = {
      topClients: topClients.map((row) => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        currency,
        meta: row.meta,
      })),
      topCaseTypes: topPracticeAreas.map((row) => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        currency,
        meta: row.meta,
      })),
      topLawyers: topLawyers.map((row) => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        currency,
        meta: row.meta,
      })),
      topPracticeAreas: topPracticeAreas.map((row) => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        currency,
        meta: row.meta,
      })),
      highestRevenueCases: highestCases.map((row) => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        currency,
        meta: row.meta,
      })),
      largestInvoices: largestInvoices.map((row) => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        currency: String(row.meta?.currency ?? currency),
        meta: row.meta,
      })),
      limit: topLimit,
    };

    const invoicedTotal =
      outstanding +
      pending +
      (invoiceMap.PAID?.amount ?? 0) +
      cancelledInvoices +
      refundedInvoices;

    const kpis: FinancialKpisDto = {
      averageInvoiceValue: round2(
        safeDivide(invoiceMap.PAID?.amount ?? 0, paidInvoiceCount || 0),
      ),
      averageRevenuePerClient: round2(safeDivide(lifetime, clientsWithRevenue)),
      averageRevenuePerCase: round2(safeDivide(lifetime, casesWithRevenue)),
      revenuePerLawyer: round2(safeDivide(lifetime, lawyersWithRevenue)),
      revenuePerMonth: round2(safeDivide(lifetime, Math.max(trendMonthsDto.filter((m) => m.revenue > 0).length, 1))),
      collectionRate: round2(safeDivide(invoiceMap.PAID?.amount ?? 0, invoicedTotal || 0) * 100),
      paymentSuccessRate: round2(
        safeDivide(paidInvoiceCount, totalInvoiceCount || 0) * 100,
      ),
      outstandingBalance: outstanding,
      averagePaymentDelayDays: round2(avgDelay),
      currency,
    };

    const charts = buildChartDatasets(trendMonthsDto, breakdownItems, currency);
    const filtersApplied = toFilterSnapshot(filter);

    return {
      paid: lifetime,
      outstanding,
      draft,
      currency,
      defaultCurrency,
      currencies: summary.currencies,
      fromInvoices,
      fromManual,
      periods: {
        today,
        yesterday,
        thisWeek,
        lastWeek,
        thisMonth,
        lastMonth,
        thisQuarter,
        lastQuarter,
        thisYear,
        lastYear,
        lifetime,
      },
      growth: {
        weekOverWeek: comparisons.weekOverWeek.percentage,
        monthOverMonth: comparisons.monthOverMonth.percentage,
        quarterOverQuarter: comparisons.quarterOverQuarter.percentage,
        yearOverYear: comparisons.yearOverYear.percentage,
      },
      byMonth: trendMonthsDto.map((row) => ({
        month: row.label,
        amount: row.revenue,
      })),
      summary,
      trend: { months: trendMonthsDto },
      comparisons,
      breakdown: {
        items: breakdownItems,
        total: breakdownTotal,
        currency,
      },
      topSources,
      kpis,
      charts,
      filtersApplied,
    };
  }
}

function buildChartDatasets(
  months: MonthlyRevenueDto[],
  breakdown: RevenueSourceDto[],
  currency: string,
): RevenueChartsDto {
  const linePoints = months.map((row) => ({
    label: row.label,
    value: row.revenue,
    secondaryValue: row.growth,
    meta: {
      invoiceCount: row.invoiceCount,
      paymentCount: row.paymentCount,
    },
  }));

  const piePoints = breakdown.map((item) => ({
    label: item.label,
    value: item.amount,
    stackKey: item.key,
    meta: { percentage: item.percentage },
  }));

  const stacked = breakdown.map((item) => ({
    id: `stacked-${item.key}`,
    name: item.label,
    chartType: 'stackedBar' as const,
    currency,
    points: months.map((row) => ({
      label: row.label,
      value: 0,
      stackKey: item.key,
    })),
  }));

  // Stacked bar uses category totals as a single-period dataset when monthly
  // category splits are not queried — frontend still receives a ready series.
  if (stacked.length > 0 && months.length > 0) {
    const lastLabel = months[months.length - 1]?.label ?? 'total';
    for (const series of stacked) {
      const match = breakdown.find((item) => item.key === series.id.replace('stacked-', ''));
      series.points = [
        {
          label: lastLabel,
          value: match?.amount ?? 0,
          stackKey: series.id.replace('stacked-', ''),
        },
      ];
    }
  }

  return {
    line: {
      id: 'revenue-line',
      name: 'Revenue Trend',
      chartType: 'line',
      points: linePoints,
      currency,
    },
    area: {
      id: 'revenue-area',
      name: 'Revenue Area',
      chartType: 'area',
      points: linePoints,
      currency,
    },
    bar: {
      id: 'revenue-bar',
      name: 'Monthly Revenue',
      chartType: 'bar',
      points: linePoints,
      currency,
    },
    stackedBar: stacked,
    pie: {
      id: 'revenue-pie',
      name: 'Revenue by Category',
      chartType: 'pie',
      points: piePoints,
      currency,
    },
    heatmap: {
      id: 'revenue-heatmap',
      name: 'Revenue Heatmap',
      chartType: 'heatmap',
      points: linePoints.map((point) => ({
        label: point.label,
        value: point.value,
      })),
      currency,
    },
  };
}

function toFilterSnapshot(filter: RevenueQueryFilter): RevenueFilterSnapshotDto {
  return {
    dateFrom: filter.dateFrom?.toISOString() ?? null,
    dateTo: filter.dateTo?.toISOString() ?? null,
    practiceArea: filter.practiceArea ?? null,
    lawyerId: filter.lawyerId ?? null,
    caseType: filter.caseType ?? null,
    clientId: filter.clientId ?? null,
    currency: filter.currency ?? null,
    source: filter.source ?? null,
    category: filter.category ?? null,
    status: filter.status ?? null,
    topLimit: filter.topLimit ?? 5,
  };
}

function startOfMonthOffset(monthsBack: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1));
}
