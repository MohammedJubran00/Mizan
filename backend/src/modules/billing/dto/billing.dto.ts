import { z } from 'zod';

// ─── Invoices ────────────────────────────────────────────────────────────────
const InvoiceTermsEnum = z.enum(['DUE_ON_RECEIPT', 'NET_7', 'NET_14', 'NET_30', 'NET_60']);
const InvoiceStatusEnum = z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']);

export const invoiceLineItemSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().int().min(0),
  rate: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100).default(0),
  discountRate: z.number().min(0).max(100).default(0),
  sortOrder: z.number().int().default(0),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid().optional().nullable(),
  caseId: z.string().uuid().optional().nullable(),
  billingLawyerUserId: z.string().uuid().optional().nullable(),
  number: z.string().trim().min(1).max(100),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default('USD'),
  status: InvoiceStatusEnum.default('DRAFT'),
  issuedAt: z.string().optional().transform((v) => (v ? new Date(v) : new Date())),
  dueAt: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  terms: InvoiceTermsEnum.default('DUE_ON_RECEIPT'),
  paymentInstructions: z.string().trim().max(2000).optional().nullable(),
  caseSummary: z.string().trim().max(5000).optional().nullable(),
  items: z.array(invoiceLineItemSchema).optional().default([]),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const listInvoicesSchema = z.object({
  clientId: z.string().uuid().optional(),
  caseId: z.string().uuid().optional(),
  status: z.string().optional(),
  from: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  to: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['issuedAt', 'amount', 'number', 'createdAt']).default('issuedAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Payments ─────────────────────────────────────────────────────────────────
const PaymentMethodEnum = z.enum(['BANK_TRANSFER', 'CREDIT_CARD', 'CASH', 'CHECK', 'ACH', 'OTHER']);

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().max(10).default('USD'),
  paymentMethod: PaymentMethodEnum.optional(),
  paymentReferenceNumber: z.string().trim().max(200).optional().nullable(),
  paymentNotes: z.string().trim().max(2000).optional().nullable(),
  occurredAt: z.string().transform((v) => new Date(v)),
  clientId: z.string().uuid().optional().nullable(),
  caseId: z.string().uuid().optional().nullable(),
  lawyerUserId: z.string().uuid().optional().nullable(),
});

// ─── Manual Revenue ───────────────────────────────────────────────────────────
const RevenueCategoryEnum = z.enum(['INVOICE_PAYMENT', 'MANUAL', 'CONSULTATION', 'COURT_FEE', 'RETAINER', 'SUBSCRIPTION', 'OTHER']);

export const createManualRevenueSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().max(10).default('USD'),
  category: RevenueCategoryEnum.default('MANUAL'),
  description: z.string().trim().max(2000).optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  caseId: z.string().uuid().optional().nullable(),
  occurredAt: z.string().transform((v) => new Date(v)),
});

// ─── Billable Hours ───────────────────────────────────────────────────────────
export const createBillableHourSchema = z.object({
  caseId: z.string().uuid().optional().nullable(),
  hours: z.number().positive().max(24),
  workedAt: z.string().transform((v) => new Date(v)),
  description: z.string().trim().max(2000).optional().nullable(),
});

export const updateBillableHourSchema = createBillableHourSchema.partial();

export const listBillingSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  clientId: z.string().uuid().optional(),
  caseId: z.string().uuid().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type CreateManualRevenueInput = z.infer<typeof createManualRevenueSchema>;
export type CreateBillableHourInput = z.infer<typeof createBillableHourSchema>;
