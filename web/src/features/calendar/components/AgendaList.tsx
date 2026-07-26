import { useMemo } from 'react'

import { buildAgendaSections } from '../lib/calendarDates'
import type { CalendarEventItem } from '../types'
import { EventCard } from './EventCard'

interface AgendaListProps {
  events: CalendarEventItem[]
  onOpenEvent: (id: string) => void
  onEditEvent: (id: string) => void
  onRescheduleEvent: (event: CalendarEventItem) => void
  onCompleteEvent: (event: CalendarEventItem) => void
  onDeleteEvent: (event: CalendarEventItem) => void
}

export function AgendaList({
  events,
  onOpenEvent,
  onEditEvent,
  onRescheduleEvent,
  onCompleteEvent,
  onDeleteEvent,
}: AgendaListProps) {
  const sections = useMemo(() => buildAgendaSections(events), [events])
  const populated = sections.filter((section) => section.events.length > 0)

  return (
    <div className="space-y-6 px-4 py-4">
      {populated.map((section) => (
        <section key={section.id} aria-labelledby={`agenda-${section.id}`}>
          <div className="mb-2.5 flex items-center gap-2">
            <h3
              id={`agenda-${section.id}`}
              className="text-xs font-semibold uppercase tracking-wide text-text-muted"
            >
              {section.label}
            </h3>
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
              {section.events.length}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border-subtle" />
          </div>

          <div className="space-y-2.5">
            {section.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showDate={section.id !== 'today' && section.id !== 'tomorrow'}
                onOpen={onOpenEvent}
                onEdit={onEditEvent}
                onReschedule={onRescheduleEvent}
                onComplete={onCompleteEvent}
                onDelete={onDeleteEvent}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
