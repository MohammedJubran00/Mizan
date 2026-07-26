import { AlertCircle, Briefcase, Download, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Button } from '@/shared/components/Button'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { useRowSelection } from '@/shared/hooks/useRowSelection'
import { downloadCsv } from '@/shared/lib/csv'
import { toast } from '@/stores/toastStore'

import { CaseFilters } from './components/CaseFilters'
import { CaseListSkeleton } from './components/CaseSkeletons'
import { CaseStats } from './components/CaseStats'
import { CaseTable } from './components/CaseTable'
import { StatusModal } from './components/StatusModal'
import { useCaseListParams } from './hooks/useCaseListParams'
import { useCaseList, useCaseMutations, useCaseStats } from './hooks/useCaseQueries'
import { caseStatusLabels, casePriorityLabels, practiceAreaLabels } from './lib/labels'
import type { CaseListItem } from './types'

const EXPORT_HEADERS = [
  'Case number',
  'Title',
  'Client',
  'Practice area',
  'Assigned lawyer',
  'Status',
  'Priority',
  'Next hearing',
  'Created',
]

function toExportRow(item: CaseListItem) {
  return [
    item.caseNumber,
    item.title,
    item.client?.fullName ?? '',
    practiceAreaLabels[item.practiceArea],
    item.leadLawyer?.fullName ?? '',
    caseStatusLabels[item.status],
    casePriorityLabels[item.priority],
    item.nextHearingAt ?? '',
    item.createdAt,
  ]
}

export function CasesListPage() {
  const navigate = useNavigate()
  const listParams = useCaseListParams()

  const { items, pagination, state, isSearching, refetch } = useCaseList(
    listParams.params,
  )
  const { stats, isLoading: statsLoading } = useCaseStats()

  const keys = useMemo(() => items.map((item) => item.id), [items])
  const selection = useRowSelection(keys)

  const [pendingDelete, setPendingDelete] = useState<CaseListItem | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<CaseListItem | null>(null)

  const { deleteCase, deleteCases, updateStatus, isDeleting, isUpdating } =
    useCaseMutations({
      onDeleted: () => {
        setPendingDelete(null)
        setBulkDeleteOpen(false)
        selection.clear()
      },
      onStatusChanged: () => setStatusTarget(null),
    })

  function exportRows(rows: CaseListItem[]) {
    if (rows.length === 0) {
      toast.info('Nothing to export', 'There are no cases matching this view.')
      return
    }

    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`cases-${stamp}.csv`, EXPORT_HEADERS, rows.map(toExportRow))
    toast.success(
      'Export ready',
      `${rows.length} ${rows.length === 1 ? 'case' : 'cases'} exported as CSV.`,
    )
  }

  const selectedItems = items.filter((item) => selection.isSelected(item.id))

  return (
    <>
      <TopBar
        title="Cases"
        subtitle="Manage and track legal matters for all active clients."
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => exportRows(items)}
              disabled={items.length === 0}
            >
              <Download className="size-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => navigate('/cases/new')}>
              <Plus className="size-4" />
              New Case
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <CaseStats stats={stats} loading={statsLoading} />

        <CaseFilters
          search={listParams.searchInput}
          status={listParams.status}
          practiceArea={listParams.practiceArea}
          priority={listParams.priority}
          sort={listParams.sort}
          searching={isSearching}
          hasActiveFilters={listParams.hasActiveFilters}
          onSearchChange={listParams.setSearchInput}
          onStatusChange={listParams.setStatus}
          onPracticeAreaChange={listParams.setPracticeArea}
          onPriorityChange={listParams.setPriority}
          onSortChange={listParams.setSort}
          onReset={listParams.reset}
        />

        {state === 'loading' ? <CaseListSkeleton /> : null}

        {state === 'error' ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load cases"
            description="Something went wrong while loading your matters. Please try again."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : null}

        {state === 'empty' || state === 'ready' ? (
          <CaseTable
            items={items}
            selection={selection}
            pagination={pagination}
            onPageChange={listParams.setPage}
            onOpen={(item) => navigate(`/cases/${item.id}`)}
            onEdit={(item) => navigate(`/cases/${item.id}/edit`)}
            onChangeStatus={(item) => setStatusTarget(item)}
            onDelete={(item) => setPendingDelete(item)}
            onBulkExport={() => exportRows(selectedItems)}
            onBulkDelete={() => setBulkDeleteOpen(true)}
            empty={
              listParams.hasActiveFilters ? (
                <EmptyState
                  icon={Search}
                  title="No matching cases"
                  description="No matters match your current search and filters. Try widening them."
                  action={
                    <Button variant="secondary" onClick={listParams.reset}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="No cases yet"
                  description="Create your first matter to track hearings, documents, deadlines, and billing in one place."
                  action={
                    <Button onClick={() => navigate('/cases/new')}>
                      <Plus className="size-4" />
                      New Case
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
        title="Delete case?"
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete case'}
        loading={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteCase.mutate(pendingDelete.id)
        }}
      >
        This action cannot be undone. All data associated with{' '}
        <strong className="font-semibold text-navy">
          {pendingDelete?.caseNumber}
        </strong>{' '}
        will be permanently removed, including hearings, documents, and billing
        history.
      </ConfirmationDialog>

      <ConfirmationDialog
        open={bulkDeleteOpen}
        title="Delete selected cases?"
        confirmLabel={isDeleting ? 'Deleting…' : `Delete ${selection.count} cases`}
        loading={isDeleting}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={() => deleteCases.mutate(selection.selected)}
      >
        This action cannot be undone. {selection.count} matters and all of their
        hearings, documents, and billing history will be permanently removed.
      </ConfirmationDialog>

      <StatusModal
        open={statusTarget !== null}
        currentStatus={statusTarget?.status ?? 'OPEN'}
        saving={isUpdating}
        onClose={() => setStatusTarget(null)}
        onApply={(status) => {
          if (statusTarget) updateStatus.mutate({ id: statusTarget.id, status })
        }}
      />
    </>
  )
}
