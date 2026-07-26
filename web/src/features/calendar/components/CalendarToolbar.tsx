import { CalendarDays, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { useId } from 'react'

import { Button } from '@/shared/components/Button'
import { SearchBar } from '@/shared/components/SearchBar'
import { cn } from '@/shared/lib/utils'

import { toDateInputValue, viewTitle } from '../lib/calendarDates'
import type { CalendarViewMode } from '../types'

const VIEW_ITEMS: Array<{ id: CalendarViewMode; label: string }> = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'day', label: 'Day' },
  { id: 'agenda', label: 'Agenda' },
]

interface CalendarToolbarProps {
  view: CalendarViewMode
  cursor: Date
  search: string
  searching: boolean
  filtersOpen: boolean
  activeFilterCount: number
  onViewChange: (view: CalendarViewMode) => void
  onSearchChange: (value: string) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onJumpToDate: (date: Date) => void
  onToggleFilters: () => void
}

export function CalendarToolbar({
  view,
  cursor,
  search,
  searching,
  filtersOpen,
  activeFilterCount,
  onViewChange,
  onSearchChange,
  onPrevious,
  onNext,
  onToday,
  onJumpToDate,
  onToggleFilters,
}: CalendarToolbarProps) {
  const jumpId = useId()

  const stepLabels: Record<CalendarViewMode, string> = {
    month: 'month',
    week: 'week',
    day: 'day',
    agenda: 'week',
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border-subtle px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevious}
            aria-label={`Previous ${stepLabels[view]}`}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-white text-text-secondary transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label={`Next ${stepLabels[view]}`}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-white text-text-secondary transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15"
          >
            <ChevronRight className="size-4" />
          </button>
          <Button size="sm" variant="secondary" onClick={onToday}>
            Today
          </Button>
        </div>

        <h2 className="min-w-0 flex-1 truncate font-display text-lg text-navy sm:text-xl">
          {viewTitle(cursor, view)}
        </h2>

        <div
          role="group"
          aria-label="Calendar view"
          className="flex items-center gap-0.5 rounded-lg border border-border bg-white p-0.5"
        >
          {VIEW_ITEMS.map((item) => {
            const active = item.id === view
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15',
                  active
                    ? 'bg-navy text-white'
                    : 'text-text-secondary hover:bg-surface-muted',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          searching={searching}
          placeholder="Search events, clients, or cases…"
          ariaLabel="Search events"
        />

        <div className="flex items-center gap-1.5">
          <label
            htmlFor={jumpId}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted"
          >
            <CalendarDays className="size-4" />
            <span className="hidden sm:inline">Jump to</span>
          </label>
          <input
            id={jumpId}
            type="date"
            value={toDateInputValue(cursor)}
            onChange={(event) => {
              const parsed = new Date(`${event.target.value}T00:00`)
              if (!Number.isNaN(parsed.getTime())) onJumpToDate(parsed)
            }}
            className="h-9 rounded-lg border border-border bg-white px-2.5 text-sm text-text outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/15"
          />
        </div>

        <Button
          size="sm"
          variant={filtersOpen ? 'primary' : 'secondary'}
          aria-expanded={filtersOpen}
          onClick={onToggleFilters}
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFilterCount > 0 ? (
            <span
              className={cn(
                'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                filtersOpen ? 'bg-white text-navy' : 'bg-navy text-white',
              )}
            >
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </div>
    </div>
  )
}
