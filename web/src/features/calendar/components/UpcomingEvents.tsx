import { CalendarClock } from 'lucide-react'

import { SectionCard } from '@/shared/components/SectionCard'
import { Skeleton } from '@/shared/components/Skeleton'
import { cn, formatShortDate, formatTime } from '@/shared/lib/utils'

import { categoryTones } from '../lib/labels'
import type { CalendarEventItem } from '../types'

interface UpcomingEventsProps {
  events: CalendarEventItem[]
  loading: boolean
  onOpenEvent: (id: string) => void
}

export function UpcomingEvents({
  events,
  loading,
  onOpenEvent,
}: UpcomingEventsProps) {
  return (
    <SectionCard
      title="Upcoming events"
      description="The next entries on the firm calendar"
      icon={CalendarClock}
      bodyClassName="px-2 py-2"
    >
      {loading ? (
        <div className="space-y-2 px-2 py-1">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="px-2 py-3 text-sm text-text-muted">
          Nothing scheduled yet. Events you create will appear here.
        </p>
      ) : (
        <ul className="space-y-1">
          {events.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onOpenEvent(event.id)}
                className="flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-1.5 size-2 shrink-0 rounded-full',
                    categoryTones[event.category].dot,
                  )}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-navy">
                    {event.title}
                  </span>
                  <span className="block truncate text-xs text-text-muted">
                    {formatShortDate(event.startAt)}
                    {event.allDay ? ' · All day' : ` · ${formatTime(event.startAt)}`}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
