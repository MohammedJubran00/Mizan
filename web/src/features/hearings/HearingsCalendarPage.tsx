import { AlertCircle, ArrowLeft, CalendarDays, List } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { cn } from '@/shared/lib/utils'

import { HearingsCalendarBoard } from './components/HearingsCalendarBoard'
import { HearingCalendarSkeleton } from './components/HearingSkeletons'
import { CapacityCard, UpcomingSidebar } from './components/UpcomingSidebar'
import { useHearingCalendar } from './hooks/useHearingQueries'
import type { CalendarViewMode } from './types'

function rangeFor(cursor: Date, view: CalendarViewMode) {
  if (view === 'day') {
    const from = new Date(cursor)
    from.setHours(0, 0, 0, 0)
    const to = new Date(cursor)
    to.setHours(23, 59, 59, 999)
    return { from: from.toISOString(), to: to.toISOString() }
  }

  if (view === 'week') {
    const start = new Date(cursor)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { from: start.toISOString(), to: end.toISOString() }
  }

  const from = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999)
  return { from: from.toISOString(), to: to.toISOString() }
}

export function HearingsCalendarPage() {
  const navigate = useNavigate()
  const [cursor, setCursor] = useState(() => new Date())
  const [view, setView] = useState<CalendarViewMode>('month')

  const params = useMemo(() => rangeFor(cursor, view), [cursor, view])
  const { events, upcoming, capacity, state, refetch } = useHearingCalendar(params)

  return (
    <>
      <TopBar
        title="Hearings Calendar"
        subtitle="Day, week, and month views of court appearances across the firm."
        actions={
          <>
            <div
              role="group"
              aria-label="Hearings view"
              className="flex items-center gap-1 rounded-lg border border-border bg-white p-0.5"
            >
              <button
                type="button"
                aria-pressed="false"
                onClick={() => navigate('/hearings')}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15"
              >
                <List className="size-3.5" />
                List
              </button>
              <button
                type="button"
                aria-pressed="true"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold',
                  'bg-navy text-white',
                )}
              >
                <CalendarDays className="size-3.5" />
                Calendar
              </button>
            </div>
            <Button size="sm" onClick={() => navigate('/hearings/new')}>
              Schedule Hearing
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {state === 'loading' ? <HearingCalendarSkeleton /> : null}

        {state === 'error' ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load calendar"
            description="Something went wrong while loading calendar events."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => refetch()}>
                  Retry
                </Button>
                <Button variant="ghost" onClick={() => navigate('/hearings')}>
                  <ArrowLeft className="size-4" />
                  Back to list
                </Button>
              </div>
            }
          />
        ) : null}

        {state === 'ready' ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
            <HearingsCalendarBoard
              events={events}
              cursor={cursor}
              view={view}
              onCursorChange={setCursor}
              onViewChange={setView}
            />
            <aside className="space-y-6">
              <UpcomingSidebar items={upcoming} />
              <CapacityCard capacity={capacity} />
            </aside>
          </div>
        ) : null}
      </div>
    </>
  )
}
