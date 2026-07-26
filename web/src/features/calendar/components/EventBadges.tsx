import { Badge } from '@/shared/components/Badge'
import { cn } from '@/shared/lib/utils'

import {
  categoryLabels,
  categoryTones,
  priorityLabels,
  priorityVariants,
  statusLabels,
  statusVariants,
} from '../lib/labels'
import type { EventCategory, EventPriority, EventStatus } from '../types'

export function CategoryBadge({
  category,
  className,
}: {
  category: EventCategory
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        categoryTones[category].chip,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', categoryTones[category].dot)}
      />
      {categoryLabels[category]}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: EventPriority }) {
  return (
    <Badge variant={priorityVariants[priority]}>{priorityLabels[priority]}</Badge>
  )
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
}
