import { Badge } from '@/shared/components/Badge'

import { casePriorityLabels, casePriorityVariants } from '../lib/labels'
import type { CasePriority } from '../types'

export function PriorityBadge({ priority }: { priority: CasePriority }) {
  return (
    <Badge variant={casePriorityVariants[priority]}>
      {casePriorityLabels[priority]} priority
    </Badge>
  )
}
