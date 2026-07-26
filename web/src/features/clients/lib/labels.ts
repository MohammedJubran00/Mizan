import type { BadgeVariant } from '@/shared/components/Badge'

import type { ClientStatus } from '../types'

export const clientStatusLabels: Record<ClientStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ARCHIVED: 'Archived',
}

export const clientStatusVariants: Record<ClientStatus, BadgeVariant> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  ARCHIVED: 'warning',
}

// Case and invoice presentation is owned by the modules that define those models.
export { caseStatusLabels, caseStatusVariants } from '@/features/cases/lib/labels'
export { invoiceStatusLabels, invoiceStatusVariants } from '@/shared/lib/billing'
