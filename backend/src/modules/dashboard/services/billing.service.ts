import { randomUUID } from 'crypto';

import type { PrismaClient, RevenueCategory } from '@prisma/client';

import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';
import type { ActivityEngineService } from '../statistics/activity-engine.service';

export interface RecordManualRevenueInput {
  workspaceId: string;
  amount: number;
  currency?: string;
  category?: RevenueCategory;
  description?: string;
  occurredAt?: Date;
  createdById?: string;
  clientId?: string;
  caseId?: string;
  lawyerUserId?: string;
}

export interface RecordPaidInvoiceBillingInput {
  workspaceId: string;
  invoiceId: string;
  amount: number;
  currency?: string;
  paidAt: Date;
  description?: string;
  clientId?: string | null;
  caseId?: string | null;
  lawyerUserId?: string | null;
  category?: RevenueCategory;
}

/**
 * Ensures Manual Revenue and Paid Invoices always land in Billing —
 * the single financial source of truth for dashboard revenue.
 */
export class BillingService {
  constructor(
    private readonly db: PrismaClient,
    private readonly activityEngine?: ActivityEngineService,
    private readonly cacheInvalidator?: CacheInvalidator,
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
    const category = input.category ?? 'MANUAL';
    const manualRevenueId = randomUUID();
    const billingId = randomUUID();

    let lawyerUserId = input.lawyerUserId ?? null;
    if (!lawyerUserId && input.caseId) {
      const legalCase = await this.db.case.findUnique({
        where: { id: input.caseId },
        select: { assignedToUserId: true, clientId: true },
      });
      lawyerUserId = legalCase?.assignedToUserId ?? null;
    }

    await this.db.$transaction(async (tx) => {
      await tx.manualRevenue.create({
        data: {
          id: manualRevenueId,
          workspaceId: input.workspaceId,
          amount: input.amount,
          currency,
          category,
          description: input.description,
          occurredAt,
          createdById: input.createdById,
          clientId: input.clientId,
          caseId: input.caseId,
        },
      });

      await tx.billing.create({
        data: {
          id: billingId,
          workspaceId: input.workspaceId,
          amount: input.amount,
          currency,
          source: 'MANUAL',
          category,
          status: 'POSTED',
          manualRevenueId,
          clientId: input.clientId,
          caseId: input.caseId,
          lawyerUserId,
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
    } else if (this.cacheInvalidator) {
      await this.cacheInvalidator.invalidateForMutation(
        input.workspaceId,
        'REVENUE_ADDED',
      );
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

    let clientId = input.clientId ?? null;
    let caseId = input.caseId ?? null;
    let lawyerUserId = input.lawyerUserId ?? null;

    if (clientId == null || caseId == null || lawyerUserId == null) {
      const invoice = await this.db.invoice.findUnique({
        where: { id: input.invoiceId },
        select: {
          clientId: true,
          caseId: true,
          case: { select: { assignedToUserId: true } },
        },
      });
      clientId = clientId ?? invoice?.clientId ?? null;
      caseId = caseId ?? invoice?.caseId ?? null;
      lawyerUserId = lawyerUserId ?? invoice?.case?.assignedToUserId ?? null;
    }

    await this.db.billing.create({
      data: {
        id: billingId,
        workspaceId: input.workspaceId,
        amount: input.amount,
        currency,
        source: 'INVOICE',
        category: input.category ?? 'INVOICE_PAYMENT',
        status: 'POSTED',
        invoiceId: input.invoiceId,
        clientId,
        caseId,
        lawyerUserId,
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
    } else if (this.cacheInvalidator) {
      await this.cacheInvalidator.invalidateForMutation(
        input.workspaceId,
        'INVOICE_PAID',
      );
    }

    return { billingId };
  }
}
