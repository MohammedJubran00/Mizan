import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { cn, formatTime } from '@/shared/lib/utils'

import type { CalendarEvent, CalendarViewMode } from '../types'

interface HearingsCalendarBoardProps {
  events: CalendarEvent[]
  cursor: Date
  view: CalendarViewMode
  onCursorChange: (date: Date) => void
  onViewChange: (view: CalendarViewMode) => void
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function eventTone(status: CalendarEvent['status']) {
  switch (status) {
    case 'COMPLETED':
      return 'border-l-success bg-success/10 text-navy'
    case 'POSTPONED':
      return 'border-l-danger bg-danger/10 text-navy'
    case 'UPCOMING':
      return 'border-l-warning bg-warning/10 text-navy'
    default:
      return 'border-l-blue bg-blue-soft text-navy'
  }
}

export function HearingsCalendarBoard({
  events,
  cursor,
  view,
  onCursorChange,
  onViewChange,
}: HearingsCalendarBoardProps) {
  const navigate = useNavigate()

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(new Date(2023, 0, 1 + index)),
    )
  }, [])

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of events) {
      const key = dayKey(new Date(event.scheduledAt))
      map.set(key, [...(map.get(key) ?? []), event])
    }
    return map
  }, [events])

  const title = useMemo(() => {
    if (view === 'day') {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(cursor)
    }
    if (view === 'week') {
      const start = addDays(startOfDay(cursor), -cursor.getDay())
      const end = addDays(start, 6)
      return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    }).format(cursor)
  }, [cursor, view])

  function shift(delta: number) {
    if (view === 'day') onCursorChange(addDays(cursor, delta))
    else if (view === 'week') onCursorChange(addDays(cursor, delta * 7))
    else onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1))
  }

  const todayKey = dayKey(new Date())

  const cells = useMemo(() => {
    if (view === 'day') return [startOfDay(cursor)]

    if (view === 'week') {
      const start = addDays(startOfDay(cursor), -cursor.getDay())
      return Array.from({ length: 7 }, (_, index) => addDays(start, index))
    }

    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const start = addDays(firstOfMonth, -firstOfMonth.getDay())
    return Array.from({ length: 42 }, (_, index) => addDays(start, index))
  }, [cursor, view])

  const toggleClass = (active: boolean) =>
    cn(
      'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition',
      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15',
      active ? 'bg-navy text-white' : 'text-text-secondary hover:bg-surface-muted',
    )

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-navy" aria-live="polite">
          {title}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Calendar range"
            className="flex items-center gap-1 rounded-lg border border-border p-0.5"
          >
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={view === mode}
                onClick={() => onViewChange(mode)}
                className={toggleClass(view === mode)}
              >
                {mode[0]!.toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <Button size="sm" variant="secondary" onClick={() => shift(-1)} aria-label="Previous">
            <ChevronLeft className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onCursorChange(new Date())}>
            Today
          </Button>
          <Button size="sm" variant="secondary" onClick={() => shift(1)} aria-label="Next">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto p-3">
        <div className={cn(view === 'month' ? 'min-w-[42rem]' : 'min-w-[36rem]')}>
          {view !== 'day' ? (
            <div className="mb-1 grid grid-cols-7 gap-1">
              {weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted"
                >
                  {label}
                </div>
              ))}
            </div>
          ) : null}

          <div
            className={cn(
              'grid gap-1',
              view === 'day' ? 'grid-cols-1' : 'grid-cols-7',
            )}
          >
            {cells.map((date) => {
              const key = dayKey(date)
              const dayEvents = byDay.get(key) ?? []
              const inMonth =
                view !== 'month' || date.getMonth() === cursor.getMonth()

              return (
                <div
                  key={key}
                  className={cn(
                    'rounded-lg border p-1.5',
                    view === 'month' ? 'min-h-24' : 'min-h-32',
                    inMonth
                      ? 'border-border-subtle bg-white'
                      : 'border-transparent bg-surface-muted/60',
                    key === todayKey && 'border-blue',
                  )}
                >
                  <p
                    className={cn(
                      'text-xs font-semibold',
                      inMonth ? 'text-text-secondary' : 'text-text-muted',
                      key === todayKey && 'text-blue',
                    )}
                  >
                    {view === 'day'
                      ? date.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })
                      : date.getDate()}
                  </p>

                  <ul className="mt-1 space-y-1">
                    {dayEvents.map((event) => (
                      <li key={event.id}>
                        <button
                          type="button"
                          onClick={() => navigate(`/hearings/${event.hearingId}`)}
                          className={cn(
                            'block w-full truncate rounded border-l-4 px-1.5 py-1 text-left text-[11px] font-medium transition',
                            'hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20',
                            eventTone(event.status),
                          )}
                        >
                          {formatTime(event.scheduledAt)} · {event.title}
                          {event.court ? (
                            <span className="mt-0.5 block truncate text-[10px] opacity-80">
                              {event.court}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="border-t border-border-subtle px-4 py-4 text-center text-sm text-text-muted">
          No hearings fall in this date range yet.
        </p>
      ) : null}
    </Card>
  )
}
