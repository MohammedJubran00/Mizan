import type { BadgeVariant } from '@/shared/components/Badge'
import type { InvoiceStatus } from '@/shared/types/billing'

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  VOID: 'Void',
}

export const invoiceStatusVariants: Record<InvoiceStatus, BadgeVariant> = {
  DRAFT: 'neutral',
  SENT: 'info',
  PAID: 'success',
  OVERDUE: 'danger',
  VOID: 'neutral',
}
