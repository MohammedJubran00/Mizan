import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Gavel,
  List,
  MapPin,
  Printer,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { MetricCard } from '@/shared/components/MetricCard'
import { Pagination } from '@/shared/components/Pagination'
import { Select } from '@/shared/components/Select'
import { cn, formatCount, formatShortDate } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import { useHearingList, useHearingMutations } from '../../hooks/useCaseQueries'
import { nextHearingOf } from '../../lib/hearings'
import { hearingStatusLabels, hearingTypeLabels } from '../../lib/labels'
import {
  HEARING_STATUSES,
  type CaseDetails,
  type Hearing,
  type HearingStatus,
} from '../../types'
import { HearingsSkeleton } from '../CaseSkeletons'
import { HearingsCalendar } from '../HearingsCalendar'
import { HearingsTable } from '../HearingsTable'
import { ScheduleHearingDialog } from '../ScheduleHearingDialog'

type ViewMode = 'list' | 'calendar'

const PAGE_SIZE = 10

const statusOptions = [
  { value: 'ALL', label: 'All hearings' },
  ...HEARING_STATUSES.map((status) => ({
    value: status,
    label: hearingStatusLabels[status],
  })),
]

export function HearingsTab({ caseDetails }: { caseDetails: CaseDetails }) {
  const [view, setView] = useState<ViewMode>('list')
  const [status, setStatus] = useState<HearingStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [month, setMonth] = useState(() => new Date())
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // Lets other screens deep-link straight into the scheduling dialog.
  useEffect(() => {
    if (searchParams.get('action') !== 'schedule') return

    setScheduleOpen(true)
    const next = new URLSearchParams(searchParams)
    next.delete('action')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const params = useMemo(
    () => ({ status, page, pageSize: PAGE_SIZE }),
    [status, page],
  )

  const { hearings, pagination, state, refetch } = useHearingList(
    caseDetails.id,
    params,
  )

  const { createHearing, isScheduling } = useHearingMutations(caseDetails.id, {
    onCreated: () => setScheduleOpen(false),
  })

  const upcoming = nextHearingOf(hearings)

  const location =
    upcoming?.room ?? upcoming?.court ?? caseDetails.court ?? null

  const hearingDefaults = useMemo(
    () => ({
      court: caseDetails.court ?? '',
      judgeName: caseDetails.judgeName ?? '',
    }),
    [caseDetails.court, caseDetails.judgeName],
  )

  function viewTranscript(hearing: Hearing) {
    if (!hearing.transcriptUrl) {
      toast.info(
        'Transcript unavailable',
        'No transcript has been filed for this hearing yet.',
      )
      return
    }

    window.open(hearing.transcriptUrl, '_blank', 'noopener,noreferrer')
  }

  async function copyDetails(hearing: Hearing) {
    const lines = [
      `${hearingTypeLabels[hearing.type]} — ${formatShortDate(hearing.scheduledAt)}`,
      hearing.court,
      hearing.room,
      hearing.judgeName,
      caseDetails.caseNumber,
    ].filter(Boolean)

    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      toast.success('Hearing details copied')
    } catch {
      toast.error('Could not copy', 'Clipboard access was denied by the browser.')
    }
  }

  const toggleClass = (active: boolean) =>
    cn(
      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15',
      active
        ? 'bg-navy text-white'
        : 'text-text-secondary hover:bg-surface-muted',
    )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Next hearing"
          value={upcoming ? formatShortDate(upcoming.scheduledAt) : '—'}
          icon={CalendarClock}
        />
        <MetricCard
          label="Total hearings"
          value={pagination ? formatCount(pagination.total) : '—'}
          icon={CalendarDays}
        />
        <MetricCard
          label="Assigned judge"
          value={upcoming?.judgeName ?? caseDetails.judgeName ?? '—'}
          icon={Gavel}
        />
        <MetricCard label="Location" value={location ?? '—'} icon={MapPin} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
          <h3 className="text-sm font-semibold text-navy">
            Upcoming &amp; Past Hearings
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Hearing view"
              className="flex items-center gap-1 rounded-lg border border-border p-0.5"
            >
              <button
                type="button"
                onClick={() => setView('list')}
                aria-pressed={view === 'list'}
                className={toggleClass(view === 'list')}
              >
                <List className="size-3.5" />
                List View
              </button>
              <button
                type="button"
                onClick={() => setView('calendar')}
                aria-pressed={view === 'calendar'}
                className={toggleClass(view === 'calendar')}
              >
                <CalendarDays className="size-3.5" />
                Calendar
              </button>
            </div>

            <Select
              aria-label="Filter hearings by status"
              fullWidth={false}
              className="h-9 w-auto min-w-36 bg-white pl-3 pr-9"
              options={statusOptions}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as HearingStatus | 'ALL')
                setPage(1)
              }}
            />

            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.print()}
              aria-label="Print hearing docket"
            >
              <Printer className="size-4" />
              Print
            </Button>

            <Button size="sm" onClick={() => setScheduleOpen(true)}>
              <CalendarPlus className="size-4" />
              Schedule Hearing
            </Button>
          </div>
        </div>

        {state === 'loading' ? (
          <div className="p-3">
            <HearingsSkeleton />
          </div>
        ) : state === 'error' ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load hearings"
            description="Something went wrong while loading the hearing schedule."
            className="border-0"
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : view === 'calendar' ? (
          <HearingsCalendar
            hearings={hearings}
            month={month}
            onMonthChange={setMonth}
            onSelect={() => setView('list')}
          />
        ) : (
          <>
            <HearingsTable
              hearings={hearings}
              onViewTranscript={viewTranscript}
              onCopyDetails={copyDetails}
              empty={
                <EmptyState
                  icon={CalendarClock}
                  title={
                    status === 'ALL' ? 'No hearings yet' : 'No matching hearings'
                  }
                  description={
                    status === 'ALL'
                      ? 'Court dates scheduled for this matter will be listed here.'
                      : 'No hearings match the selected status filter.'
                  }
                  className="border-0 py-10"
                  action={
                    status === 'ALL' ? (
                      <Button onClick={() => setScheduleOpen(true)}>
                        <CalendarPlus className="size-4" />
                        Schedule Hearing
                      </Button>
                    ) : (
                      <Button variant="secondary" onClick={() => setStatus('ALL')}>
                        Clear filter
                      </Button>
                    )
                  }
                />
              }
            />

            {pagination ? (
              <Pagination
                page={pagination.page}
                pageSize={pagination.pageSize}
                total={pagination.total}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </Card>

      <ScheduleHearingDialog
        open={scheduleOpen}
        saving={isScheduling}
        defaults={hearingDefaults}
        onClose={() => setScheduleOpen(false)}
        onSubmit={(payload) => createHearing.mutate(payload)}
      />
    </div>
  )
}
