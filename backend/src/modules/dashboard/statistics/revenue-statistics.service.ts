import type { RevenueCardDto } from '../dto';
import type { RevenueDashboardDto } from '../revenue/dto/revenue-analytics.dto';
import type { RevenueFilterInput } from '../revenue/filters/revenue-filter';
import type { RevenueAnalyticsService } from '../revenue/services/revenue-analytics.service';
import type { WorkspacePeriods } from '../../../shared/utils/timezone';

export interface RevenueStatisticsResult {
  card: RevenueCardDto;
  /** Full revenue analytics engine payload (also used as dashboard `revenue`). */
  analytics: RevenueDashboardDto;
}

/**
 * Dashboard revenue facade — delegates to the Revenue Analytics Engine.
 * Preserves overview card mapping for existing dashboard consumers.
 */
export class RevenueStatisticsService {
  constructor(private readonly revenueAnalytics: RevenueAnalyticsService) {}

  async calculate(
    workspaceId: string,
    periods: WorkspacePeriods,
    filter: RevenueFilterInput = { topLimit: 5 },
    timezone = 'UTC',
  ): Promise<RevenueStatisticsResult> {
    const analytics = await this.revenueAnalytics.calculate({
      workspaceId,
      timezone,
      periods,
      filter,
    });

    return {
      card: {
        totalPaid: analytics.paid,
        currency: analytics.currency,
        invoiceCount: analytics.summary.invoiceCount,
        paidInvoiceCount: analytics.summary.paidInvoiceCount,
        outstanding: analytics.outstanding,
        fromInvoices: analytics.fromInvoices,
        fromManual: analytics.fromManual,
        trendLabel:
          analytics.paid === 0 && analytics.outstanding === 0
            ? 'No revenue yet'
            : `${analytics.currency} ${analytics.paid}`,
      },
      analytics,
    };
  }
}
