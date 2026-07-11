import type { RevenueBreakdownDto, RevenueCardDto } from '../dto';
import type { DashboardInvoiceRepository } from '../repositories/dashboard-invoice.repository';

export interface RevenueStatisticsResult {
  card: RevenueCardDto;
  breakdown: RevenueBreakdownDto;
}

/**
 * Invoice / revenue statistics for one workspace.
 */
export class RevenueStatisticsService {
  constructor(private readonly invoiceRepository: DashboardInvoiceRepository) {}

  async calculate(workspaceId: string): Promise<RevenueStatisticsResult> {
    const [paid, outstanding, draft, invoiceCount, paidInvoiceCount, byMonth] =
      await Promise.all([
        this.invoiceRepository.calculatePaidRevenue(workspaceId),
        this.invoiceRepository.calculateOutstandingRevenue(workspaceId),
        this.invoiceRepository.calculateDraftRevenue(workspaceId),
        this.invoiceRepository.countInvoices(workspaceId),
        this.invoiceRepository.countPaidInvoices(workspaceId),
        this.invoiceRepository.calculatePaidRevenueByMonth(workspaceId, 6),
      ]);

    const currency = 'USD';

    return {
      card: {
        totalPaid: paid,
        currency,
        invoiceCount,
        paidInvoiceCount,
        outstanding,
        trendLabel: paid === 0 && outstanding === 0 ? 'No revenue yet' : `${currency} ${paid}`,
      },
      breakdown: {
        paid,
        outstanding,
        draft,
        currency,
        byMonth,
      },
    };
  }
}
