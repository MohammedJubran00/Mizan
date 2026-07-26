import {
  AlertCircle,
  CalendarDays,
  CalendarPlus,
  Download,
  Gavel,
  List,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Button } from '@/shared/components/Button'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { useRowSelection } from '@/shared/hooks/useRowSelection'
import { downloadCsv } from '@/shared/lib/csv'
import { cn, formatShortDate, formatTime } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import { HearingFilters } from './components/HearingFilters'
import { HearingListSkeleton } from './components/HearingSkeletons'
import { HearingStats } from './components/HearingStats'
import { HearingsTable } from './components/HearingsTable'
import { OutcomeModal } from './components/OutcomeModal'
import { RescheduleModal } from './components/RescheduleModal'
import { useHearingListParams } from './hooks/useHearingListParams'
import {
  useHearingList,
  useHearingMutations,
  useHearingStats,
} from './hooks/useHearingQueries'
import { hearingStatusLabels, hearingTypeLabels } from './lib/labels'
import type { HearingListItem } from './types'

const EXPORT_HEADERS = [
  'Date',
  'Time',
  'Case number',
  'Case title',
  'Client',
  'Court',
  'Judge',
  'Lawyer',
  'Type',
  'Status',
]

function toExportRow(item: HearingListItem) {
  return [
    formatShortDate(item.scheduledAt),
    formatTime(item.scheduledAt),
    item.caseRef?.caseNumber ?? '',
    item.caseRef?.title ?? '',
    item.client?.fullName ?? '',
    item.court ?? '',
    item.judgeName ?? '',
    item.leadLawyer?.fullName ?? '',
    hearingTypeLabels[item.type],
    hearingStatusLabels[item.status],
  ]
}

export function HearingsListPage() {
  const navigate = useNavigate()
  const listParams = useHearingListParams()

  const { items, pagination, state, isSearching, refetch } = useHearingList(
    listParams.params,
  )
  const { stats, isLoading: statsLoading } = useHearingStats()

  const keys = useMemo(() => items.map((item) => item.id), [items])
  const selection = useRowSelection(keys)

  const [pendingDelete, setPendingDelete] = useState<HearingListItem | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [outcomeTarget, setOutcomeTarget] = useState<HearingListItem | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<HearingListItem | null>(
    null,
  )

  const {
    deleteHearing,
    deleteHearings,
    updateOutcome,
    rescheduleHearing,
    isDeleting,
    isUpdating,
  } = useHearingMutations({
    onDeleted: () => {
      setPendingDelete(null)
      setBulkDeleteOpen(false)
      selection.clear()
    },
    onOutcomeUpdated: () => setOutcomeTarget(null),
    onRescheduled: () => setRescheduleTarget(null),
  })

  function exportRows(rows: HearingListItem[]) {
    if (rows.length === 0) {
      toast.info('Nothing to export', 'There are no hearings matching this view.')
      return
    }
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`hearings-${stamp}.csv`, EXPORT_HEADERS, rows.map(toExportRow))
    toast.success(
      'Export ready',
      `${rows.length} ${rows.length === 1 ? 'hearing' : 'hearings'} exported as CSV.`,
    )
  }

  function printRows(rows: HearingListItem[]) {
    if (rows.length === 0) {
      toast.info('Nothing to print', 'Select at least one hearing first.')
      return
    }
    toast.info(
      'Opening print dialog',
      `Preparing ${rows.length} ${rows.length === 1 ? 'hearing' : 'hearings'}.`,
    )
    window.print()
  }

  const selectedItems = items.filter((item) => selection.isSelected(item.id))

  const viewToggle = (
    <div
      role="group"
      aria-label="Hearings view"
      className="flex items-center gap-1 rounded-lg border border-border bg-white p-0.5"
    >
      <button
        type="button"
        aria-pressed="true"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold',
          'bg-navy text-white',
        )}
      >
        <List className="size-3.5" />
        List
      </button>
      <button
        type="button"
        aria-pressed="false"
        onClick={() => navigate('/hearings/calendar')}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15"
      >
        <CalendarDays className="size-3.5" />
        Calendar
      </button>
    </div>
  )

  return (
    <>
      <TopBar
        title="Hearings"
        subtitle="Track and manage all legal proceedings across active cases."
        actions={
          <>
            {viewToggle}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => exportRows(items)}
              disabled={items.length === 0}
            >
              <Download className="size-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => navigate('/hearings/new')}>
              <CalendarPlus className="size-4" />
              Schedule Hearing
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <HearingStats stats={stats} loading={statsLoading} />

        <HearingFilters
          search={listParams.searchInput}
          status={listParams.status}
          type={listParams.type}
          sort={listParams.sort}
          searching={isSearching}
          hasActiveFilters={listParams.hasActiveFilters}
          onSearchChange={listParams.setSearchInput}
          onStatusChange={listParams.setStatus}
          onTypeChange={listParams.setType}
          onSortChange={listParams.setSort}
          onReset={listParams.reset}
        />

        {state === 'loading' ? <HearingListSkeleton /> : null}

        {state === 'error' ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load hearings"
            description="Something went wrong while loading the hearing schedule. Please try again."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : null}

        {state === 'empty' || state === 'ready' ? (
          <HearingsTable
            items={items}
            selection={selection}
            pagination={pagination}
            onPageChange={listParams.setPage}
            onOpen={(item) => navigate(`/hearings/${item.id}`)}
            onEdit={(item) => navigate(`/hearings/${item.id}/edit`)}
            onDelete={(item) => setPendingDelete(item)}
            onReschedule={(item) => setRescheduleTarget(item)}
            onPrint={(item) => printRows([item])}
            onUpdateOutcome={(item) => setOutcomeTarget(item)}
            onBulkExport={() => exportRows(selectedItems)}
            onBulkDelete={() => setBulkDeleteOpen(true)}
            onBulkPrint={() => printRows(selectedItems)}
            empty={
              listParams.hasActiveFilters ? (
                <EmptyState
                  icon={Search}
                  title="No matching hearings"
                  description="No hearings match your current search and filters. Try widening them."
                  action={
                    <Button variant="secondary" onClick={listParams.reset}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Gavel}
                  title="No hearings yet"
                  description="Schedule your first court appearance to track dates, outcomes, and follow-ups across the firm."
                  action={
                    <Button onClick={() => navigate('/hearings/new')}>
                      <CalendarPlus className="size-4" />
                      Schedule Hearing
                    </Button>
                  }
                />
              )
            }
          />
        ) : null}
      </div>

      <ConfirmationDialog
        open={pendingDelete !== null}
        title="Delete Hearing?"
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete Permanently'}
        loading={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteHearing.mutate(pendingDelete.id)
        }}
      >
        This action cannot be undone. All associated notes and transcripts for this
        session will be permanently archived.
      </ConfirmationDialog>

      <ConfirmationDialog
        open={bulkDeleteOpen}
        title="Delete selected hearings?"
        confirmLabel={
          isDeleting ? 'Deleting…' : `Delete ${selection.count} hearings`
        }
        loading={isDeleting}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={() => deleteHearings.mutate(selection.selected)}
      >
        This action cannot be undone. {selection.count} hearings and their related
        notes and transcripts will be permanently removed.
      </ConfirmationDialog>

      <OutcomeModal
        open={outcomeTarget !== null}
        hearing={outcomeTarget}
        saving={isUpdating}
        onClose={() => setOutcomeTarget(null)}
        onSave={(payload) => {
          if (outcomeTarget) {
            updateOutcome.mutate({ id: outcomeTarget.id, payload })
          }
        }}
      />

      <RescheduleModal
        open={rescheduleTarget !== null}
        hearing={rescheduleTarget}
        saving={isUpdating}
        onClose={() => setRescheduleTarget(null)}
        onSave={(payload) => {
          if (rescheduleTarget) {
            rescheduleHearing.mutate({ id: rescheduleTarget.id, payload })
          }
        }}
      />
    </>
  )
}
