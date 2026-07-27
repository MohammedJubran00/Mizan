import { AppError } from '../../../shared/errors/AppError';
import type { AuthContext } from '../../../shared/types/auth-context';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';
import type { BillingRepository, InvoiceRow } from '../repositories/billing.repository';
import type {
  CreateBillableHourInput,
  CreateInvoiceInput,
  CreateManualRevenueInput,
  ListInvoicesQuery,
  RecordPaymentInput,
  UpdateInvoiceInput,
} from '../dto/billing.dto';

function mapInvoice(row: InvoiceRow) {
  return {
    id: row.id,
    number: row.number,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    terms: row.terms,
    issuedAt: row.issuedAt.toISOString(),
    dueAt: row.dueAt?.toISOString() ?? null,
    paymentInstructions: row.paymentInstructions ?? null,
    caseSummary: row.caseSummary ?? null,
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    client: row.client ?? null,
    case: row.case ?? null,
    billingLawyer: row.billingLawyer ?? null,
    items: (row.items ?? []).map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      rate: Number(item.rate),
      taxRate: Number(item.taxRate),
      discountRate: Number(item.discountRate),
      amount: Number(item.amount),
      sortOrder: item.sortOrder,
    })),
    payment: row.billing ? {
      id: row.billing.id,
      status: row.billing.status,
      paymentMethod: row.billing.paymentMethod,
      occurredAt: row.billing.occurredAt.toISOString(),
    } : null,
  };
}

export class BillingModuleService {
  constructor(
    private readonly repository: BillingRepository,
    private readonly activityEngine?: ActivityEngineService,
    private readonly cacheInvalidator?: CacheInvalidator,
  ) {}

  // ─── Invoices ─────────────────────────────────────────────────────────────
  async listInvoices(auth: AuthContext, query: ListInvoicesQuery) {
    const { rows, total } = await this.repository.findManyInvoices(auth.workspaceId, query);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);
    return {
      success: true,
      items: rows.map(mapInvoice),
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages, hasMore: query.page < totalPages },
    };
  }

  async getInvoiceById(auth: AuthContext, id: string) {
    const row = await this.repository.findInvoiceById(auth.workspaceId, id);
    if (!row) throw new AppError(404, 'Invoice not found.');
    return mapInvoice(row);
  }

  async createInvoice(auth: AuthContext, input: CreateInvoiceInput) {
    const { items, ...rest } = input;
    const lineItemsTotal = items.reduce((sum, item) => {
      const gross = item.quantity * item.rate;
      const afterDiscount = gross * (1 - item.discountRate / 100);
      return sum + afterDiscount * (1 + item.taxRate / 100);
    }, 0);
    const amount = items.length > 0 ? lineItemsTotal : rest.amount;

    const row = await this.repository.createInvoice({
      workspace: { connect: { id: auth.workspaceId } },
      number: rest.number,
      amount,
      currency: rest.currency ?? 'USD',
      status: rest.status ?? 'DRAFT',
      issuedAt: rest.issuedAt ?? new Date(),
      dueAt: rest.dueAt,
      terms: rest.terms ?? 'DUE_ON_RECEIPT',
      paymentInstructions: rest.paymentInstructions,
      caseSummary: rest.caseSummary,
      client: rest.clientId ? { connect: { id: rest.clientId } } : undefined,
      case: rest.caseId ? { connect: { id: rest.caseId } } : undefined,
      billingLawyer: rest.billingLawyerUserId ? { connect: { id: rest.billingLawyerUserId } } : undefined,
      items: items.length > 0 ? {
        create: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          taxRate: item.taxRate ?? 0,
          discountRate: item.discountRate ?? 0,
          sortOrder: item.sortOrder ?? 0,
          amount: (() => {
            const gross = item.quantity * item.rate;
            const afterDiscount = gross * (1 - (item.discountRate ?? 0) / 100);
            return afterDiscount * (1 + (item.taxRate ?? 0) / 100);
          })(),
        })),
      } : undefined,
    });

    await this.activityEngine?.recordInvoiceCreated({ workspaceId: auth.workspaceId, actorId: auth.user.id, invoiceId: row.id, amount: Number(row.amount), currency: row.currency });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'INVOICE_CREATED');

    return mapInvoice(row);
  }

  async updateInvoice(auth: AuthContext, id: string, input: UpdateInvoiceInput) {
    const existing = await this.repository.findInvoiceById(auth.workspaceId, id);
    if (!existing) throw new AppError(404, 'Invoice not found.');

    const { items, clientId, caseId, billingLawyerUserId, ...rest } = input;
    const updateData: any = { ...rest };
    if (clientId !== undefined) updateData.client = clientId ? { connect: { id: clientId } } : { disconnect: true };
    if (caseId !== undefined) updateData.case = caseId ? { connect: { id: caseId } } : { disconnect: true };
    if (billingLawyerUserId !== undefined) updateData.billingLawyer = billingLawyerUserId ? { connect: { id: billingLawyerUserId } } : { disconnect: true };

    if (items !== undefined && items.length > 0) {
      updateData.items = {
        deleteMany: {},
        create: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          taxRate: item.taxRate ?? 0,
          discountRate: item.discountRate ?? 0,
          sortOrder: item.sortOrder ?? 0,
          amount: (() => {
            const gross = item.quantity * item.rate;
            const afterDiscount = gross * (1 - (item.discountRate ?? 0) / 100);
            return afterDiscount * (1 + (item.taxRate ?? 0) / 100);
          })(),
        })),
      };
    }

    const row = await this.repository.updateInvoice(auth.workspaceId, id, updateData);
    if (!row) throw new AppError(404, 'Invoice not found.');
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'INVOICE_CREATED');
    return mapInvoice(row);
  }

  async voidInvoice(auth: AuthContext, id: string) {
    return this.updateInvoice(auth, id, { status: 'CANCELLED' });
  }

  async markSent(auth: AuthContext, id: string) {
    return this.updateInvoice(auth, id, { status: 'SENT' });
  }

  async markPaid(auth: AuthContext, id: string) {
    const row = await this.repository.updateInvoice(auth.workspaceId, id, {
      status: 'PAID',
      paidAt: new Date(),
    });
    if (!row) throw new AppError(404, 'Invoice not found.');
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'INVOICE_PAID');
    return mapInvoice(row);
  }

  async deleteInvoice(auth: AuthContext, id: string): Promise<void> {
    const deleted = await this.repository.deleteInvoice(auth.workspaceId, id);
    if (!deleted) throw new AppError(404, 'Invoice not found.');
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'INVOICE_CREATED');
  }

  // ─── Payments ──────────────────────────────────────────────────────────────
  async recordPayment(auth: AuthContext, input: RecordPaymentInput) {
    const invoice = await this.repository.findInvoiceById(auth.workspaceId, input.invoiceId);
    if (!invoice) throw new AppError(404, 'Invoice not found.');

    const billing = await this.repository.createBilling({
      workspace: { connect: { id: auth.workspaceId } },
      amount: input.amount,
      currency: input.currency ?? 'USD',
      source: 'INVOICE',
      category: 'INVOICE_PAYMENT',
      status: 'POSTED',
      occurredAt: input.occurredAt,
      paymentMethod: input.paymentMethod,
      paymentReferenceNumber: input.paymentReferenceNumber,
      paymentNotes: input.paymentNotes,
      invoice: { connect: { id: input.invoiceId } },
      client: input.clientId ? { connect: { id: input.clientId } } : undefined,
      case: input.caseId ? { connect: { id: input.caseId } } : undefined,
      lawyer: input.lawyerUserId ? { connect: { id: input.lawyerUserId } } : undefined,
    });

    await this.repository.updateInvoice(auth.workspaceId, input.invoiceId, { status: 'PAID', paidAt: input.occurredAt });

    await this.activityEngine?.recordInvoicePaid({ workspaceId: auth.workspaceId, actorId: auth.user.id, targetId: input.invoiceId, amount: input.amount, currency: input.currency ?? 'USD' });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'INVOICE_PAID');

    return billing;
  }

  async listPayments(auth: AuthContext, query: { page: number; pageSize: number; clientId?: string; caseId?: string }) {
    const { rows, total } = await this.repository.findManyBillings(auth.workspaceId, query);
    const totalPages = Math.ceil(total / query.pageSize) || 0;
    return {
      success: true,
      items: rows.map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        currency: r.currency,
        source: r.source,
        category: r.category,
        status: r.status,
        occurredAt: r.occurredAt.toISOString(),
        paymentMethod: r.paymentMethod ?? null,
        paymentReferenceNumber: r.paymentReferenceNumber ?? null,
        paymentNotes: r.paymentNotes ?? null,
        description: r.description ?? null,
      })),
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages },
    };
  }

  // ─── Manual Revenue ────────────────────────────────────────────────────────
  async createManualRevenue(auth: AuthContext, input: CreateManualRevenueInput) {
    const mr = await this.repository.createManualRevenue({
      workspace: { connect: { id: auth.workspaceId } },
      amount: input.amount,
      currency: input.currency ?? 'USD',
      category: input.category ?? 'MANUAL',
      description: input.description,
      occurredAt: input.occurredAt,
      client: input.clientId ? { connect: { id: input.clientId } } : undefined,
      case: input.caseId ? { connect: { id: input.caseId } } : undefined,
      createdBy: { connect: { id: auth.user.id } },
    });

    await this.repository.createBilling({
      workspace: { connect: { id: auth.workspaceId } },
      amount: input.amount,
      currency: input.currency ?? 'USD',
      source: 'MANUAL',
      category: input.category ?? 'MANUAL',
      status: 'POSTED',
      occurredAt: input.occurredAt,
      description: input.description,
      manualRevenue: { connect: { id: mr.id } },
      client: input.clientId ? { connect: { id: input.clientId } } : undefined,
      case: input.caseId ? { connect: { id: input.caseId } } : undefined,
    });

    await this.activityEngine?.record({ workspaceId: auth.workspaceId, actorId: auth.user.id, type: 'REVENUE_ADDED', title: `Manual revenue: ${input.amount} ${input.currency ?? 'USD'}` });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'REVENUE_ADDED');

    return mr;
  }

  async listManualRevenues(auth: AuthContext, query: { page: number; pageSize: number }) {
    const { rows, total } = await this.repository.findManyManualRevenues(auth.workspaceId, query);
    const totalPages = Math.ceil(total / query.pageSize) || 0;
    return {
      success: true,
      items: rows.map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        currency: r.currency,
        category: r.category,
        description: r.description ?? null,
        occurredAt: r.occurredAt.toISOString(),
        createdAt: r.createdAt.toISOString(),
      })),
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages },
    };
  }

  // ─── Billable Hours ────────────────────────────────────────────────────────
  async createBillableHour(auth: AuthContext, input: CreateBillableHourInput) {
    const entry = await this.repository.createBillableHour({
      workspace: { connect: { id: auth.workspaceId } },
      hours: input.hours,
      workedAt: input.workedAt,
      description: input.description,
      user: { connect: { id: auth.user.id } },
      case: input.caseId ? { connect: { id: input.caseId } } : undefined,
    });
    return entry;
  }

  async listBillableHours(auth: AuthContext, query: { page: number; pageSize: number; caseId?: string }) {
    const { rows, total } = await this.repository.findManyBillableHours(auth.workspaceId, query);
    const totalPages = Math.ceil(total / query.pageSize) || 0;
    return {
      success: true,
      items: rows.map((r) => ({
        id: r.id,
        hours: Number(r.hours),
        workedAt: r.workedAt.toISOString(),
        description: r.description ?? null,
        caseId: r.caseId ?? null,
        userId: r.userId ?? null,
      })),
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages },
    };
  }

  async updateBillableHour(auth: AuthContext, id: string, input: Partial<CreateBillableHourInput>) {
    const updateData: any = { ...input };
    if ('caseId' in input) {
      updateData.case = input.caseId ? { connect: { id: input.caseId } } : { disconnect: true };
      delete updateData.caseId;
    }
    const row = await this.repository.updateBillableHour(auth.workspaceId, id, updateData);
    if (!row) throw new AppError(404, 'Billable hour entry not found.');
    return row;
  }

  async deleteBillableHour(auth: AuthContext, id: string): Promise<void> {
    const deleted = await this.repository.deleteBillableHour(auth.workspaceId, id);
    if (!deleted) throw new AppError(404, 'Billable hour entry not found.');
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  async summary(auth: AuthContext) {
    return this.repository.summary(auth.workspaceId);
  }
}
