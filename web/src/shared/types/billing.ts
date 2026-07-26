export const INVOICE_STATUSES = [
  'DRAFT',
  'SENT',
  'PAID',
  'OVERDUE',
  'VOID',
] as const

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export interface Invoice {
  id: string
  number: string
  amount: number
  currency: string
  status: InvoiceStatus
  issuedAt: string
  dueAt?: string | null
}

export interface PaymentSummary {
  totalPaid: number
  outstanding: number
  currency: string
}
