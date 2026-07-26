import { Badge } from '@/shared/components/Badge'

import { hearingStatusLabels, hearingStatusVariants } from '../lib/labels'
import type { HearingStatus } from '../types'

export function HearingStatusBadge({ status }: { status: HearingStatus }) {
  return (
    <Badge variant={hearingStatusVariants[status]}>
      {hearingStatusLabels[status]}
    </Badge>
  )
}
