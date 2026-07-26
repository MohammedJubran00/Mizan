import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/shared/components/Button'
import { cn, formatTime } from '@/shared/lib/utils'

import { hearingTypeLabels } from '../lib/labels'
import type { Hearing } from '../types'

interface HearingsCalendarProps {
  hearings: Hearing[]
  month: Date
  onMonthChange: (month: Date) => void
  onSelect: (hearing: Hearing) => void
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function HearingsCalendar({
  hearings,
  month,
  onMonthChange,
  onSelect,
}: HearingsCalendarProps) {
  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
    // 2023-01-01 was a Sunday, giving a stable localized weekday sequence.
    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(new Date(2023, 0, 1 + index)),
    )
  }, [])

  const byDay = useMemo(() => {
    const map = new Map<string, Hearing[]>()

    for (const hearing of hearings) {
      const key = dayKey(new Date(hearing.scheduledAt))
      map.set(key, [...(map.get(key) ?? []), hearing])
    }

    return map
  }, [hearings])

  const cells = useMemo(() => {
    const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    const start = new Date(firstOfMonth)
    start.setDate(1 - firstOfMonth.getDay())

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return date
    })
  }, [month])

  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(month)

  const todayKey = dayKey(new Date())

  function shiftMonth(delta: number) {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + delta, 1))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <h3 className="text-sm font-semibold text-navy" aria-live="polite">
          {monthLabel}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onMonthChange(new Date())}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto px-2 pb-3">
        <div className="min-w-[38rem]">
          <div className="grid grid-cols-7 gap-1 px-1 pb-1">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className="px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 p-1">
            {cells.map((date) => {
              const key = dayKey(date)
              const dayHearings = byDay.get(key) ?? []
              const isCurrentMonth = date.getMonth() === month.getMonth()

              return (
                <div
                  key={key}
                  className={cn(
                    'min-h-20 rounded-lg border p-1.5',
                    isCurrentMonth
                      ? 'border-border-subtle bg-white'
                      : 'border-transparent bg-surface-muted/60',
                    key === todayKey && 'border-blue',
                  )}
                >
                  <p
                    className={cn(
                      'text-xs font-semibold',
                      isCurrentMonth ? 'text-text-secondary' : 'text-text-muted',
                      key === todayKey && 'text-blue',
                    )}
                  >
                    {date.getDate()}
                  </p>

                  <ul className="mt-1 space-y-1">
                    {dayHearings.map((hearing) => (
                      <li key={hearing.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(hearing)}
                          className="block w-full truncate rounded bg-blue-soft px-1.5 py-1 text-left text-[11px] font-medium text-blue transition hover:bg-blue/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30"
                        >
                          {formatTime(hearing.scheduledAt)} ·{' '}
                          {hearingTypeLabels[hearing.type]}
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

      {hearings.length === 0 ? (
        <p className="border-t border-border-subtle px-4 py-4 text-center text-sm text-text-muted">
          No hearings have been scheduled for this matter yet.
        </p>
      ) : null}
    </div>
  )
}
