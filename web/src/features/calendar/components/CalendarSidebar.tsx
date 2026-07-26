import { CalendarRange, Layers, Tags } from 'lucide-react'

import { Card } from '@/shared/components/Card'
import { Checkbox } from '@/shared/components/Checkbox'
import { SectionCard } from '@/shared/components/SectionCard'
import { Skeleton } from '@/shared/components/Skeleton'
import { cn, formatCount } from '@/shared/lib/utils'

import { categoryLabels, categoryTones } from '../lib/labels'
import { EVENT_CATEGORIES, type CalendarEventItem, type CalendarSource, type EventCategory } from '../types'
import { MiniCalendar } from './MiniCalendar'
import { UpcomingEvents } from './UpcomingEvents'

interface CalendarSidebarProps {
  cursor: Date
  events: CalendarEventItem[]
  upcoming: CalendarEventItem[]
  upcomingLoading: boolean
  calendars: CalendarSource[]
  calendarsLoading: boolean
  hiddenCalendars: string[]
  hiddenCategories: EventCategory[]
  onSelectDate: (date: Date) => void
  onOpenEvent: (id: string) => void
  onToggleCalendar: (id: string) => void
  onToggleCategory: (category: EventCategory) => void
}

export function CalendarSidebar({
  cursor,
  events,
  upcoming,
  upcomingLoading,
  calendars,
  calendarsLoading,
  hiddenCalendars,
  hiddenCategories,
  onSelectDate,
  onOpenEvent,
  onToggleCalendar,
  onToggleCategory,
}: CalendarSidebarProps) {
  return (
    <aside className="space-y-5">
      <Card>
        <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
          <CalendarRange className="size-4 text-blue" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-navy">Jump to date</h2>
        </div>
        <MiniCalendar cursor={cursor} events={events} onSelectDate={onSelectDate} />
      </Card>

      <UpcomingEvents
        events={upcoming}
        loading={upcomingLoading}
        onOpenEvent={onOpenEvent}
      />

      <SectionCard
        title="My calendars"
        description="Choose which calendars are visible"
        icon={Layers}
        bodyClassName="px-4 py-3"
      >
        {calendarsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }, (_, index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>
        ) : calendars.length === 0 ? (
          <p className="text-sm text-text-muted">
            No additional calendars are connected. Firm events appear on the default
            calendar.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {calendars.map((calendar) => (
              <li key={calendar.id} className="flex items-center justify-between gap-2">
                <Checkbox
                  label={calendar.name}
                  checked={!hiddenCalendars.includes(calendar.id)}
                  onChange={() => onToggleCalendar(calendar.id)}
                />
                {typeof calendar.eventCount === 'number' ? (
                  <span className="text-xs text-text-muted">
                    {formatCount(calendar.eventCount)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Event categories"
        description="Toggle a category to filter the calendar"
        icon={Tags}
        bodyClassName="px-4 py-3"
      >
        <ul className="space-y-2">
          {EVENT_CATEGORIES.map((category) => {
            const hidden = hiddenCategories.includes(category)

            return (
              <li key={category}>
                <button
                  type="button"
                  aria-pressed={!hidden}
                  onClick={() => onToggleCategory(category)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20',
                    hidden
                      ? 'text-text-muted hover:bg-surface-muted'
                      : 'text-text-secondary hover:bg-surface-muted',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-2.5 rounded-full transition',
                      categoryTones[category].dot,
                      hidden && 'opacity-30',
                    )}
                  />
                  <span className={cn('truncate', hidden && 'line-through')}>
                    {categoryLabels[category]}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </SectionCard>
    </aside>
  )
}
