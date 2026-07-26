import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/shared/lib/utils'

import {
  dayKey,
  isSameDay,
  monthMatrix,
  startOfMonth,
  weekdayLabels,
} from '../lib/calendarDates'
import type { CalendarEventItem } from '../types'

interface MiniCalendarProps {
  cursor: Date
  events: CalendarEventItem[]
  onSelectDate: (date: Date) => void
}

export function MiniCalendar({ cursor, events, onSelectDate }: MiniCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(cursor))

  useEffect(() => setVisibleMonth(startOfMonth(cursor)), [cursor])

  const cells = monthMatrix(visibleMonth)
  const labels = weekdayLabels()
  const today = new Date()

  const eventDays = new Set(events.map((event) => dayKey(event.startAt)))

  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth)

  function shiftMonth(direction: 1 | -1) {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + direction, 1),
    )
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-sm font-semibold text-navy">{monthLabel}</p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div
        role="grid"
        aria-label={`${monthLabel} date picker`}
        className="mt-3 grid grid-cols-7 gap-0.5"
      >
        {labels.map((label) => (
          <span
            key={label}
            role="columnheader"
            aria-label={label}
            className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-text-muted"
          >
            {label.slice(0, 2)}
          </span>
        ))}

        {cells.map((date) => {
          const outside = date.getMonth() !== visibleMonth.getMonth()
          const selected = isSameDay(date, cursor)
          const isToday = isSameDay(date, today)
          const hasEvents = eventDays.has(dayKey(date))

          return (
            <button
              key={date.toISOString()}
              type="button"
              role="gridcell"
              aria-selected={selected}
              aria-label={date.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              onClick={() => onSelectDate(date)}
              className={cn(
                'relative flex h-8 items-center justify-center rounded-lg text-xs font-medium transition',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15',
                outside ? 'text-text-muted' : 'text-text-secondary',
                selected
                  ? 'bg-navy text-white hover:bg-navy-deep'
                  : 'hover:bg-surface-muted',
                !selected && isToday && 'text-blue',
              )}
            >
              {date.getDate()}
              {hasEvents ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute bottom-1 size-1 rounded-full',
                    selected ? 'bg-white' : 'bg-blue',
                  )}
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
