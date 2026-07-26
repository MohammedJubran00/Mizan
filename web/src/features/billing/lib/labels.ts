import type { BadgeVariant } from '@/shared/components/Badge'
import {
  invoiceStatusLabels,
  invoiceStatusVariants,
} from '@/shared/lib/billing'

import type {
  CurrencyCode,
  InvoiceTerms,
  InvoiceTimelineKind,
  PaymentMethod,
  PaymentStatus,
} from '../types'

export { invoiceStatusLabels, invoiceStatusVariants }

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Bank transfer',
  CREDIT_CARD: 'Credit card',
  CASH: 'Cash',
  CHECK: 'Check',
  ACH: 'ACH',
  OTHER: 'Other',
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  REFUNDED: 'Refunded',
  FAILED: 'Failed',
}

export const paymentStatusVariants: Record<PaymentStatus, BadgeVariant> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  REFUNDED: 'neutral',
  FAILED: 'danger',
}

export const currencyLabels: Record<CurrencyCode, string> = {
  USD: 'USD ($)',
  EUR: 'EUR (€)',
  GBP: 'GBP (£)',
  AED: 'AED (د.إ)',
  SAR: 'SAR (﷼)',
}

export const currencyOptions = (
  Object.entries(currencyLabels) as Array<[CurrencyCode, string]>
).map(([value, label]) => ({ value, label }))

export const termsLabels: Record<InvoiceTerms, string> = {
  DUE_ON_RECEIPT: 'Due on receipt',
  NET_7: 'Net 7',
  NET_14: 'Net 14',
  NET_30: 'Net 30',
  NET_60: 'Net 60',
}

export const termsOptions = (
  Object.entries(termsLabels) as Array<[InvoiceTerms, string]>
).map(([value, label]) => ({ value, label }))

export const timelineKindLabels: Record<InvoiceTimelineKind, string> = {
  CREATED: 'Invoice created',
  SENT: 'Invoice sent',
  VIEWED: 'Viewed by client',
  PAYMENT_RECORDED: 'Payment recorded',
  PAID: 'Paid in full',
  OVERDUE: 'Marked overdue',
  VOIDED: 'Voided',
  NOTE: 'Note added',
}

export const INVOICE_STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'PAID', label: 'Paid' },
  { value: 'SENT', label: 'Pending' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'DRAFT', label: 'Draft' },
] as const

export const PAYMENT_STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'REFUNDED', label: 'Refunded' },
] as const
