import { Badge } from '@/shared/components/Badge'

import { caseStatusLabels, caseStatusVariants } from '../lib/labels'
import type { CaseStatus } from '../types'

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <Badge variant={caseStatusVariants[status]}>{caseStatusLabels[status]}</Badge>
  )
}
