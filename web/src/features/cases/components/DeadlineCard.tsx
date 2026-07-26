import { CalendarClock } from 'lucide-react'

import { Badge } from '@/shared/components/Badge'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatShortDate, formatRelativeTime } from '@/shared/lib/utils'

import {
  casePriorityLabels,
  casePriorityVariants,
  deadlineStatusLabels,
  deadlineStatusVariants,
} from '../lib/labels'
import type { CaseDeadline } from '../types'

interface DeadlineCardProps {
  deadlines: CaseDeadline[]
}

export function DeadlineCard({ deadlines }: DeadlineCardProps) {
  const sorted = [...deadlines].sort(
    (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
  )

  return (
    <SectionCard title="Critical Deadlines" icon={CalendarClock}>
      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">
          No deadlines have been recorded for this matter yet.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {sorted.map((deadline) => (
            <li
              key={deadline.id}
              className="rounded-xl border border-border-subtle bg-surface-muted px-3.5 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  {deadline.label}
                </p>
                <Badge variant={deadlineStatusVariants[deadline.status]}>
                  {deadlineStatusLabels[deadline.status]}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-navy">
                {formatShortDate(deadline.dueAt)}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                {formatRelativeTime(deadline.dueAt)}
              </p>
              {deadline.priority ? (
                <span className="mt-2 inline-block">
                  <Badge variant={casePriorityVariants[deadline.priority]}>
                    {casePriorityLabels[deadline.priority]} priority
                  </Badge>
                </span>
              ) : null}
              {deadline.note ? (
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {deadline.note}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
