import { calculateGrowthPercent } from '../../../shared/utils/math';
import type { WorkspacePeriods } from '../../../shared/utils/timezone';
import type { RevenueBreakdownDto, RevenueCardDto } from '../dto';
import type { DashboardBillingRepository } from '../repositories/dashboard-billing.repository';
import type { DashboardInvoiceRepository } from '../repositories/dashboard-billing.repository';

export interface RevenueStatisticsResult {
  card: RevenueCardDto;
  breakdown: RevenueBreakdownDto;
}

/**
 * Revenue statistics from Billing (paid invoices + manual revenue).
 * Periods and growth respect workspace timezone bounds.
 */
export class RevenueStatisticsService {
  constructor(
    private readonly billingRepository: DashboardBillingRepository,
    private readonly invoiceRepository: DashboardInvoiceRepository,
  ) {}

  async calculate(
    workspaceId: string,
    periods: WorkspacePeriods,
  ): Promise<RevenueStatisticsResult> {
    const [
      lifetime,
      fromInvoices,
      fromManual,
      today,
      yesterday,
      thisWeek,
      lastWeek,
      thisMonth,
      lastMonth,
      thisQuarter,
      thisYear,
      lastYear,
      outstanding,
      draft,
      invoiceCount,
      paidInvoiceCount,
      byMonth,
    ] = await Promise.all([
      this.billingRepository.sumLifetime(workspaceId),
      this.billingRepository.sumBySource(workspaceId, 'INVOICE'),
      this.billingRepository.sumBySource(workspaceId, 'MANUAL'),
      this.billingRepository.sumInPeriod(workspaceId, periods.today),
      this.billingRepository.sumInPeriod(workspaceId, periods.yesterday),
      this.billingRepository.sumInPeriod(workspaceId, periods.thisWeek),
      this.billingRepository.sumInPeriod(workspaceId, periods.lastWeek),
      this.billingRepository.sumInPeriod(workspaceId, periods.thisMonth),
      this.billingRepository.sumInPeriod(workspaceId, periods.lastMonth),
      this.billingRepository.sumInPeriod(workspaceId, periods.thisQuarter),
      this.billingRepository.sumInPeriod(workspaceId, periods.thisYear),
      this.billingRepository.sumInPeriod(workspaceId, periods.lastYear),
      this.invoiceRepository.calculateOutstandingRevenue(workspaceId),
      this.invoiceRepository.calculateDraftRevenue(workspaceId),
      this.invoiceRepository.countInvoices(workspaceId),
      this.invoiceRepository.countPaidInvoices(workspaceId),
      this.billingRepository.calculateRevenueByMonth(workspaceId, 6),
    ]);

    const currency = 'USD';
    const growth = {
      weekOverWeek: calculateGrowthPercent(thisWeek, lastWeek),
      monthOverMonth: calculateGrowthPercent(thisMonth, lastMonth),
      yearOverYear: calculateGrowthPercent(thisYear, lastYear),
    };

    return {
      card: {
        totalPaid: lifetime,
        currency,
        invoiceCount,
        paidInvoiceCount,
        outstanding,
        fromInvoices,
        fromManual,
        trendLabel:
          lifetime === 0 && outstanding === 0
            ? 'No revenue yet'
            : `${currency} ${lifetime}`,
      },
      breakdown: {
        paid: lifetime,
        outstanding,
        draft,
        currency,
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
          thisYear,
          lastYear,
          lifetime,
        },
        growth,
        byMonth,
      },
    };
  }
}
