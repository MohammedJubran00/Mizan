import { AlertCircle, CalendarPlus, CalendarX2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'

import { AgendaList } from './components/AgendaList'
import { CalendarFilters } from './components/CalendarFilters'
import { CalendarSidebar } from './components/CalendarSidebar'
import { CalendarToolbar } from './components/CalendarToolbar'
import { CompletionModal } from './components/CompletionModal'
import { DeleteEventModal } from './components/DeleteEventModal'
import {
  AgendaSkeleton,
  CalendarBoardSkeleton,
  CalendarSidebarSkeleton,
} from './components/EventSkeletons'
import { MonthGrid } from './components/MonthGrid'
import { RescheduleEventModal } from './components/RescheduleEventModal'
import { TimeGrid } from './components/TimeGrid'
import { useCalendarParams } from './hooks/useCalendarParams'
import {
  useCalendarSources,
  useEventList,
  useEventMutations,
  useUpcomingEvents,
  type EventTimeChange,
} from './hooks/useEventQueries'
import { toDateInputValue, toTimeInputValue } from './lib/calendarDates'
import type {
  CalendarEventItem,
  EventCompletionPayload,
  EventReschedulePayload,
} from './types'

type ActiveDialog = 'reschedule' | 'complete' | 'delete' | null

export function CalendarPage() {
  const navigate = useNavigate()
  const params = useCalendarParams()

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [dialog, setDialog] = useState<ActiveDialog>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null)

  const { items, pagination, state, isSearching, refetch } = useEventList(params.params)
  const upcoming = useUpcomingEvents(5)
  const sources = useCalendarSources()

  const mutations = useEventMutations({
    onRescheduled: () => closeDialog(),
    onCompleted: () => closeDialog(),
    onDeleted: () => closeDialog(),
  })

  function closeDialog() {
    setDialog(null)
    setSelectedEvent(null)
  }

  function openDialog(dialogName: Exclude<ActiveDialog, null>) {
    return (event: CalendarEventItem) => {
      setSelectedEvent(event)
      setDialog(dialogName)
    }
  }

  function openEvent(id: string) {
    navigate(`/calendar/events/${id}`)
  }

  function editEvent(id: string) {
    navigate(`/calendar/events/${id}/edit`)
  }

  function createAt(date: Date) {
    const search = new URLSearchParams({ date: toDateInputValue(date) })
    if (date.getHours() !== 0 || date.getMinutes() !== 0) {
      search.set('time', toTimeInputValue(date))
    }
    navigate(`/calendar/events/new?${search.toString()}`)
  }

  function moveEvent(change: EventTimeChange) {
    mutations.moveEvent.mutate(change)
  }

  function openDay(date: Date) {
    params.goToDate(date)
    params.setView('day')
  }

  function saveReschedule(payload: EventReschedulePayload) {
    if (!selectedEvent) return
    mutations.rescheduleEvent.mutate({ id: selectedEvent.id, payload })
  }

  function saveCompletion(payload: EventCompletionPayload) {
    if (!selectedEvent) return
    mutations.completeEvent.mutate({ id: selectedEvent.id, payload })
  }

  function confirmDelete() {
    if (!selectedEvent) return
    mutations.deleteEvent.mutate(selectedEvent.id)
  }

  const activeFilterCount = [
    params.category !== 'ALL',
    params.priority !== 'ALL',
    params.status !== 'ALL',
    Boolean(params.lawyerId),
    Boolean(params.clientId),
    Boolean(params.caseId),
    Boolean(params.from),
    Boolean(params.to),
  ].filter(Boolean).length

  const emptyDescription = params.hasActiveFilters
    ? 'No events match the current search and filters. Try widening the range or resetting the filters.'
    : 'Nothing is scheduled in this period yet. Create your first event to start building the firm calendar.'

  function renderBody() {
    if (state === 'loading') {
      return params.view === 'agenda' ? <AgendaSkeleton /> : <CalendarBoardSkeleton />
    }

    if (state === 'error') {
      return (
        <div className="px-4 py-6">
          <EmptyState
            icon={AlertCircle}
            title="Could not load the calendar"
            description="Something went wrong while loading events for this period."
            className="border-0"
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      )
    }

    if (params.view === 'agenda') {
      if (state === 'empty') {
        return (
          <div className="px-4 py-6">
            <EmptyState
              icon={CalendarX2}
              title="No events scheduled"
              description={emptyDescription}
              className="border-0"
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={() => createAt(params.cursor)}>
                    <CalendarPlus className="size-4" />
                    New Event
                  </Button>
                  {params.hasActiveFilters ? (
                    <Button variant="secondary" onClick={params.reset}>
                      Reset filters
                    </Button>
                  ) : null}
                </div>
              }
            />
          </div>
        )
      }

      return (
        <>
          <AgendaList
            events={items}
            onOpenEvent={openEvent}
            onEditEvent={editEvent}
            onRescheduleEvent={openDialog('reschedule')}
            onCompleteEvent={openDialog('complete')}
            onDeleteEvent={openDialog('delete')}
          />
          {pagination && pagination.totalPages > 1 ? (
            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={params.setPage}
            />
          ) : null}
        </>
      )
    }

    return (
      <>
        {/* The grid still renders when empty; the notice explains the blank period. */}
        {state === 'empty' ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-surface-muted/60 px-4 py-3">
            <p className="text-sm text-text-secondary">{emptyDescription}</p>
            <div className="flex flex-wrap gap-2">
              {params.hasActiveFilters ? (
                <Button size="sm" variant="secondary" onClick={params.reset}>
                  Reset filters
                </Button>
              ) : null}
              <Button size="sm" onClick={() => createAt(params.cursor)}>
                <CalendarPlus className="size-4" />
                New Event
              </Button>
            </div>
          </div>
        ) : null}

        {params.view === 'month' ? (
          <MonthGrid
            cursor={params.cursor}
            events={items}
            onOpenEvent={openEvent}
            onCreateAt={createAt}
            onMoveEvent={moveEvent}
            onSelectDay={openDay}
          />
        ) : (
          <TimeGrid
            cursor={params.cursor}
            view={params.view}
            events={items}
            onOpenEvent={openEvent}
            onCreateAt={createAt}
            onMoveEvent={moveEvent}
            onSelectDay={openDay}
          />
        )}
      </>
    )
  }

  return (
    <>
      <TopBar
        title="Calendar"
        subtitle="Hearings, meetings, deadlines, and tasks across the firm."
        actions={
          <Button size="sm" onClick={() => createAt(params.cursor)}>
            <CalendarPlus className="size-4" />
            New Event
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <Card className="overflow-hidden">
            <CalendarToolbar
              view={params.view}
              cursor={params.cursor}
              search={params.searchInput}
              searching={isSearching}
              filtersOpen={filtersOpen}
              activeFilterCount={activeFilterCount}
              onViewChange={params.setView}
              onSearchChange={params.setSearchInput}
              onPrevious={params.stepBack}
              onNext={params.stepForward}
              onToday={params.goToToday}
              onJumpToDate={params.goToDate}
              onToggleFilters={() => setFiltersOpen((open) => !open)}
            />

            {filtersOpen ? (
              <CalendarFilters
                category={params.category}
                priority={params.priority}
                status={params.status}
                from={params.from}
                to={params.to}
                hasActiveFilters={params.hasActiveFilters}
                onCategoryChange={params.setCategory}
                onPriorityChange={params.setPriority}
                onStatusChange={params.setStatus}
                onLawyerChange={params.setLawyer}
                onClientChange={params.setClient}
                onCaseChange={params.setCase}
                onFromChange={params.setFrom}
                onToChange={params.setTo}
                onReset={params.reset}
              />
            ) : null}

            {renderBody()}
          </Card>

          {sources.isLoading && upcoming.isLoading ? (
            <CalendarSidebarSkeleton />
          ) : (
            <CalendarSidebar
              cursor={params.cursor}
              events={items}
              upcoming={upcoming.events}
              upcomingLoading={upcoming.isLoading}
              calendars={sources.calendars}
              calendarsLoading={sources.isLoading}
              hiddenCalendars={params.hiddenCalendars}
              hiddenCategories={params.hiddenCategories}
              onSelectDate={params.goToDate}
              onOpenEvent={openEvent}
              onToggleCalendar={params.toggleCalendar}
              onToggleCategory={params.toggleCategory}
            />
          )}
        </div>
      </div>

      <RescheduleEventModal
        open={dialog === 'reschedule'}
        event={selectedEvent}
        saving={mutations.rescheduleEvent.isPending}
        onSave={saveReschedule}
        onClose={closeDialog}
      />

      <CompletionModal
        open={dialog === 'complete'}
        event={selectedEvent}
        saving={mutations.completeEvent.isPending}
        onSave={saveCompletion}
        onClose={closeDialog}
      />

      <DeleteEventModal
        open={dialog === 'delete'}
        event={selectedEvent}
        deleting={mutations.isDeleting}
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      />
    </>
  )
}
