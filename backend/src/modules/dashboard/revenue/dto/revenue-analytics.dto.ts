/**
 * Growth direction for revenue comparisons.
 * Always calculated — never stored.
 */
export type GrowthDirection = 'INCREASE' | 'DECREASE' | 'NO_CHANGE';

export interface RevenueSummaryDto {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  thisQuarter: number;
  lastQuarter: number;
  thisYear: number;
  lastYear: number;
  lifetime: number;
  outstanding: number;
  paid: number;
  pending: number;
  cancelled: number;
  refunded: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  currency: string;
  currencies: string[];
}

export interface MonthlyRevenueDto {
  month: number;
  year: number;
  label: string;
  revenue: number;
  growth: number;
  invoiceCount: number;
  paymentCount: number;
  currency: string;
}

export interface RevenueTrendDto {
  months: MonthlyRevenueDto[];
}

export interface RevenueGrowthMetricDto {
  currentValue: number;
  previousValue: number;
  percentage: number;
  direction: GrowthDirection;
}

export interface RevenueComparisonDto {
  weekOverWeek: RevenueGrowthMetricDto;
  monthOverMonth: RevenueGrowthMetricDto;
  quarterOverQuarter: RevenueGrowthMetricDto;
  yearOverYear: RevenueGrowthMetricDto;
  lifetimeGrowth: RevenueGrowthMetricDto;
}

export interface RevenueSourceDto {
  key: string;
  label: string;
  amount: number;
  percentage: number;
  currency: string;
}

export interface RevenueCategoryBreakdownDto {
  items: RevenueSourceDto[];
  total: number;
  currency: string;
}

export interface RevenueNamedAmountDto {
  id: string;
  name: string;
  amount: number;
  currency: string;
  meta?: Record<string, string | number | null>;
}

export interface TopRevenueSourcesDto {
  topClients: RevenueNamedAmountDto[];
  topCaseTypes: RevenueNamedAmountDto[];
  topLawyers: RevenueNamedAmountDto[];
  topPracticeAreas: RevenueNamedAmountDto[];
  highestRevenueCases: RevenueNamedAmountDto[];
  largestInvoices: RevenueNamedAmountDto[];
  limit: number;
}

export interface FinancialKpisDto {
  averageInvoiceValue: number;
  averageRevenuePerClient: number;
  averageRevenuePerCase: number;
  revenuePerLawyer: number;
  revenuePerMonth: number;
  collectionRate: number;
  paymentSuccessRate: number;
  outstandingBalance: number;
  averagePaymentDelayDays: number;
  currency: string;
}

export interface RevenueChartPointDto {
  label: string;
  value: number;
  secondaryValue?: number;
  stackKey?: string;
  meta?: Record<string, string | number | null>;
}

export interface RevenueChartSeriesDto {
  id: string;
  name: string;
  chartType: 'line' | 'area' | 'bar' | 'stackedBar' | 'pie' | 'heatmap';
  points: RevenueChartPointDto[];
  currency: string;
}

export interface RevenueChartsDto {
  line: RevenueChartSeriesDto;
  area: RevenueChartSeriesDto;
  bar: RevenueChartSeriesDto;
  stackedBar: RevenueChartSeriesDto[];
  pie: RevenueChartSeriesDto;
  /** Reserved for future heatmap widgets. */
  heatmap: RevenueChartSeriesDto;
}

export interface RevenueFilterSnapshotDto {
  dateFrom: string | null;
  dateTo: string | null;
  practiceArea: string | null;
  lawyerId: string | null;
  caseType: string | null;
  clientId: string | null;
  currency: string | null;
  source: string | null;
  category: string | null;
  status: string | null;
  topLimit: number;
}

/**
 * Full revenue analytics payload — reusable by Dashboard and future Analytics pages.
 * Includes Task 2 compatibility fields so existing clients keep working.
 */
export interface RevenueDashboardDto {
  /** @deprecated Prefer summary.paid — kept for Task 2 clients. */
  paid: number;
  outstanding: number;
  draft: number;
  currency: string;
  defaultCurrency: string;
  currencies: string[];
  fromInvoices: number;
  fromManual: number;
  periods: {
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
    thisQuarter: number;
    lastQuarter: number;
    thisYear: number;
    lastYear: number;
    lifetime: number;
  };
  /** Simple percentage growth (Task 2 compatibility). */
  growth: {
    weekOverWeek: number;
    monthOverMonth: number;
    quarterOverQuarter: number;
    yearOverYear: number;
  };
  byMonth: Array<{ month: string; amount: number }>;

  summary: RevenueSummaryDto;
  trend: RevenueTrendDto;
  comparisons: RevenueComparisonDto;
  breakdown: RevenueCategoryBreakdownDto;
  topSources: TopRevenueSourcesDto;
  kpis: FinancialKpisDto;
  charts: RevenueChartsDto;
  filtersApplied: RevenueFilterSnapshotDto;
}
