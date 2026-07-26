import { Plus } from 'lucide-react'
import { useMemo, useState, type DragEvent } from 'react'

import { cn } from '@/shared/lib/utils'

import {
  addMinutes,
  dayKey,
  groupByDay,
  isSameDay,
  minutesBetween,
  monthMatrix,
  weekdayLabels,
} from '../lib/calendarDates'
import { hasEventDragPayload, readEventDragPayload } from '../lib/dragTransfer'
import type { CalendarEventItem } from '../types'
import { EventChip } from './EventChip'

const MAX_VISIBLE = 3

interface MonthGridProps {
  cursor: Date
  events: CalendarEventItem[]
  onOpenEvent: (id: string) => void
  onCreateAt: (date: Date) => void
  onMoveEvent: (change: { id: string; startAt: string; endAt: string }) => void
  onSelectDay: (date: Date) => void
}

export function MonthGrid({
  cursor,
  events,
  onOpenEvent,
  onCreateAt,
  onMoveEvent,
  onSelectDay,
}: MonthGridProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  const cells = useMemo(() => monthMatrix(cursor), [cursor])
  const eventsByDay = useMemo(() => groupByDay(events), [events])
  const labels = weekdayLabels()
  const today = new Date()

  function onDrop(dropEvent: DragEvent<HTMLDivElement>, date: Date) {
    dropEvent.preventDefault()
    setDropTarget(null)

    const payload = readEventDragPayload(dropEvent.dataTransfer)
    if (!payload) return

    const originalStart = new Date(payload.startAt)
    const originalEnd = new Date(payload.endAt)
    const duration = Math.max(minutesBetween(originalStart, originalEnd), 15)

    // Keep the time of day, only the date changes in the month view.
    const nextStart = new Date(date)
    nextStart.setHours(
      originalStart.getHours(),
      originalStart.getMinutes(),
      0,
      0,
    )

    if (nextStart.getTime() === originalStart.getTime()) return

    onMoveEvent({
      id: payload.id,
      startAt: nextStart.toISOString(),
      endAt: addMinutes(nextStart, duration).toISOString(),
    })
  }

  return (
    // The month keeps a minimum width so cells stay readable on phones.
    <div className="overflow-x-auto">
      <div className="grid min-w-[40rem] grid-cols-7 border-b border-border-subtle bg-surface-muted/60">
        {labels.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid min-w-[40rem] grid-cols-7">
        {cells.map((date) => {
          const key = dayKey(date)
          const dayEvents = eventsByDay.get(key) ?? []
          const outside = date.getMonth() !== cursor.getMonth()
          const isToday = isSameDay(date, today)
          const expanded = expandedDay === key
          const visible = expanded ? dayEvents : dayEvents.slice(0, MAX_VISIBLE)
          const hiddenCount = dayEvents.length - visible.length

          return (
            <div
              key={key}
              onDragOver={(dragEvent) => {
                if (!hasEventDragPayload(dragEvent.dataTransfer)) return
                dragEvent.preventDefault()
                dragEvent.dataTransfer.dropEffect = 'move'
                setDropTarget(key)
              }}
              onDragLeave={() => setDropTarget((current) => (current === key ? null : current))}
              onDrop={(dragEvent) => onDrop(dragEvent, date)}
              className={cn(
                'group/cell relative min-h-28 border-b border-r border-border-subtle p-1.5 transition',
                outside ? 'bg-surface-muted/40' : 'bg-white',
                dropTarget === key && 'bg-blue-soft ring-2 ring-inset ring-blue/40',
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => onSelectDay(date)}
                  aria-label={`Open ${date.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}`}
                  className={cn(
                    'inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/25',
                    isToday
                      ? 'bg-navy text-white'
                      : outside
                        ? 'text-text-muted hover:bg-surface-muted'
                        : 'text-text-secondary hover:bg-surface-muted',
                  )}
                >
                  {date.getDate()}
                </button>

                <button
                  type="button"
                  onClick={() => onCreateAt(date)}
                  aria-label={`Add event on ${date.toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                  })}`}
                  className="rounded-md p-1 text-text-muted opacity-0 transition hover:bg-surface-muted hover:text-navy focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20 group-hover/cell:opacity-100"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <div className="mt-1 space-y-1">
                {visible.map((event) => (
                  <EventChip
                    key={event.id}
                    event={event}
                    draggable
                    onOpen={onOpenEvent}
                  />
                ))}

                {hiddenCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setExpandedDay(key)}
                    className="w-full rounded-md px-1.5 py-0.5 text-left text-[11px] font-semibold text-blue transition hover:bg-blue-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30"
                  >
                    +{hiddenCount} more
                  </button>
                ) : null}

                {expanded && dayEvents.length > MAX_VISIBLE ? (
                  <button
                    type="button"
                    onClick={() => setExpandedDay(null)}
                    className="w-full rounded-md px-1.5 py-0.5 text-left text-[11px] font-semibold text-text-muted transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
                  >
                    Show less
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
