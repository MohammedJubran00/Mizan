import { History } from 'lucide-react'

import { SectionCard } from '@/shared/components/SectionCard'
import { formatDateTime, formatRelativeTime } from '@/shared/lib/utils'

import type { CaseTimelineEvent } from '../types'

interface TimelineCardProps {
  events: CaseTimelineEvent[]
  title?: string
  emptyLabel?: string
}

export function TimelineCard({
  events,
  title = 'Timeline',
  emptyLabel = 'No activity has been recorded on this matter yet.',
}: TimelineCardProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )

  return (
    <SectionCard title={title} icon={History}>
      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">{emptyLabel}</p>
      ) : (
        <ol className="space-y-4">
          {sorted.map((event, index) => (
            <li key={event.id} className="relative flex gap-3">
              {index < sorted.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[7px] top-5 h-[calc(100%+0.5rem)] w-px bg-border-subtle"
                />
              ) : null}
              <span
                aria-hidden="true"
                className="mt-1.5 size-3.5 shrink-0 rounded-full border-2 border-blue bg-white"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-navy">{event.title}</p>
                  <time
                    dateTime={event.occurredAt}
                    title={formatDateTime(event.occurredAt)}
                    className="text-xs text-text-muted"
                  >
                    {formatRelativeTime(event.occurredAt)}
                  </time>
                </div>
                {event.description ? (
                  <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
                    {event.description}
                  </p>
                ) : null}
                {event.actorName ? (
                  <p className="mt-0.5 text-xs text-text-muted">{event.actorName}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  )
}
