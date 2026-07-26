import type { InvoiceStatus } from '@/shared/types/billing'

export type { InvoiceStatus }
export { INVOICE_STATUSES } from '@/shared/types/billing'

export const PAYMENT_METHODS = [
  'BANK_TRANSFER',
  'CREDIT_CARD',
  'CASH',
  'CHECK',
  'ACH',
  'OTHER',
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_STATUSES = [
  'PENDING',
  'COMPLETED',
  'REFUNDED',
  'FAILED',
] as const

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const BILLING_CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR'] as const

export type CurrencyCode = (typeof BILLING_CURRENCIES)[number]

export const INVOICE_TERMS = [
  'DUE_ON_RECEIPT',
  'NET_7',
  'NET_14',
  'NET_30',
  'NET_60',
] as const

export type InvoiceTerms = (typeof INVOICE_TERMS)[number]

export const INVOICE_TIMELINE_KINDS = [
  'CREATED',
  'SENT',
  'VIEWED',
  'PAYMENT_RECORDED',
  'PAID',
  'OVERDUE',
  'VOIDED',
  'NOTE',
] as const

export type InvoiceTimelineKind = (typeof INVOICE_TIMELINE_KINDS)[number]

export interface BillingPersonRef {
  id: string
  fullName: string
  email?: string | null
  subtitle?: string | null
}

export interface BillingCaseRef {
  id: string
  caseNumber: string
  title: string
  clientId?: string | null
}

export interface Tax {
  rate: number
  amount: number
}

export interface Discount {
  rate: number
  amount: number
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  taxRate: number
  discountRate: number
  amount: number
}

export interface InvoiceTimelineEvent {
  id: string
  kind: InvoiceTimelineKind
  title: string
  description?: string | null
  occurredAt: string
}

export interface InvoiceNote {
  id: string
  body: string
  authorName?: string | null
  createdAt: string
}

export interface InvoiceActivity {
  id: string
  title: string
  description?: string | null
  actorName?: string | null
  occurredAt: string
}

/** Row shape used by the billing dashboard invoice table. */
export interface InvoiceListItem {
  id: string
  number: string
  client: BillingPersonRef | null
  relatedCase: BillingCaseRef | null
  issueDate: string
  dueDate?: string | null
  amount: number
  currency: CurrencyCode
  status: InvoiceStatus
  billingLawyer?: BillingPersonRef | null
}

export interface InvoiceDetails {
  id: string
  number: string
  status: InvoiceStatus
  currency: CurrencyCode
  terms: InvoiceTerms
  issueDate: string
  dueDate?: string | null
  client: BillingPersonRef | null
  relatedCase: BillingCaseRef | null
  billingLawyer: BillingPersonRef | null
  items: InvoiceItem[]
  subtotal: number
  tax: Tax
  discount: Discount
  total: number
  amountPaid: number
  balanceDue: number
  paymentInstructions?: string | null
  caseSummary?: string | null
  timeline: InvoiceTimelineEvent[]
  payments: Payment[]
  activities: InvoiceActivity[]
  notes: InvoiceNote[]
  createdAt: string
  updatedAt: string
}

export interface InvoicePayload {
  clientId: string
  caseId?: string | null
  billingLawyerId: string
  currency: CurrencyCode
  terms: InvoiceTerms
  issueDate: string
  dueDate: string
  items: Array<{
    description: string
    quantity: number
    rate: number
    taxRate: number
    discountRate: number
  }>
  paymentInstructions?: string
  caseSummary?: string
  status?: 'DRAFT' | 'SENT'
}

export interface Payment {
  id: string
  invoiceId: string
  invoiceNumber: string
  client: BillingPersonRef | null
  amount: number
  currency: CurrencyCode
  method: PaymentMethod
  status: PaymentStatus
  paymentDate: string
  referenceNumber?: string | null
  notes?: string | null
  recordedAt: string
}

export interface PaymentPayload {
  invoiceId: string
  paymentDate: string
  method: PaymentMethod
  amount: number
  referenceNumber?: string
  notes?: string
}

export interface BillingSummary {
  totalRevenue: number
  outstandingBalance: number
  paidInvoiceCount: number
  overdueInvoiceCount: number
  paymentsThisMonth: number
  currency: CurrencyCode
  urgentOutstandingCount: number
  paidProgress: number
}

export interface RevenueProjectionPoint {
  label: string
  amount: number
}

export interface RevenueInsights {
  totalCollected: number
  quarterlyGoal: number
  progressPercent: number
  currency: CurrencyCode
}

export interface BillingPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface InvoiceListResponse {
  items: InvoiceListItem[]
  pagination: BillingPagination
}

export interface PaymentListResponse {
  items: Payment[]
  pagination: BillingPagination
}

export interface SendInvoicePayload {
  recipient: string
  cc: string
  subject: string
  message: string
  includePdf: boolean
}

export interface BillingActionRequired {
  id: string
  title: string
  description: string
  href?: string
}
