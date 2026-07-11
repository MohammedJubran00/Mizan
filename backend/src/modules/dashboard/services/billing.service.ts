import { randomUUID } from 'crypto';

import type { PrismaClient } from '@prisma/client';

import type { ActivityEngineService } from '../statistics/activity-engine.service';

export interface RecordManualRevenueInput {
  workspaceId: string;
  amount: number;
  currency?: string;
  description?: string;
  occurredAt?: Date;
  createdById?: string;
}

export interface RecordPaidInvoiceBillingInput {
  workspaceId: string;
  invoiceId: string;
  amount: number;
  currency?: string;
  paidAt: Date;
  description?: string;
}

/**
 * Ensures Manual Revenue and Paid Invoices always land in Billing —
 * the single financial source of truth for dashboard revenue.
 */
export class BillingService {
  constructor(
    private readonly db: PrismaClient,
    private readonly activityEngine?: ActivityEngineService,
  ) {}

  /**
   * Creates a ManualRevenue row and mirrors it into Billing atomically.
   */
  async recordManualRevenue(input: RecordManualRevenueInput): Promise<{
    manualRevenueId: string;
    billingId: string;
  }> {
    const occurredAt = input.occurredAt ?? new Date();
    const currency = input.currency ?? 'USD';
    const manualRevenueId = randomUUID();
    const billingId = randomUUID();

    await this.db.$transaction(async (tx) => {
      await tx.manualRevenue.create({
        data: {
          id: manualRevenueId,
          workspaceId: input.workspaceId,
          amount: input.amount,
          currency,
          description: input.description,
          occurredAt,
          createdById: input.createdById,
        },
      });

      await tx.billing.create({
        data: {
          id: billingId,
          workspaceId: input.workspaceId,
          amount: input.amount,
          currency,
          source: 'MANUAL',
          manualRevenueId,
          occurredAt,
          description: input.description ?? 'Manual revenue',
        },
      });
    });

    if (this.activityEngine) {
      await this.activityEngine.recordRevenueAdded({
        workspaceId: input.workspaceId,
        actorId: input.createdById,
        amount: input.amount,
        currency,
        targetId: manualRevenueId,
      });
    }

    return { manualRevenueId, billingId };
  }

  /**
   * Mirrors a paid invoice into Billing (idempotent on invoiceId).
   */
  async recordPaidInvoice(input: RecordPaidInvoiceBillingInput): Promise<{ billingId: string }> {
    const existing = await this.db.billing.findUnique({
      where: { invoiceId: input.invoiceId },
      select: { id: true },
    });

    if (existing) {
      return { billingId: existing.id };
    }

    const billingId = randomUUID();
    const currency = input.currency ?? 'USD';

    await this.db.billing.create({
      data: {
        id: billingId,
        workspaceId: input.workspaceId,
        amount: input.amount,
        currency,
        source: 'INVOICE',
        invoiceId: input.invoiceId,
        occurredAt: input.paidAt,
        description: input.description ?? 'Paid invoice',
      },
    });

    if (this.activityEngine) {
      await this.activityEngine.recordInvoicePaid({
        workspaceId: input.workspaceId,
        amount: input.amount,
        currency,
        targetId: input.invoiceId,
      });
    }

    return { billingId };
  }
}
