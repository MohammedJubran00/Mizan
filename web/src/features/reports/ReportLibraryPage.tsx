import {
  AlertCircle,
  BarChart3,
  Copy,
  Download,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  Type,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Badge } from '@/shared/components/Badge'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'
import { EmptyState } from '@/shared/components/EmptyState'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { Pagination } from '@/shared/components/Pagination'
import { SearchBar } from '@/shared/components/SearchBar'
import { Select } from '@/shared/components/Select'
import { formatCount, formatDateTime, formatPercent, formatShortDate } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import { DeleteReportDialog } from './components/DeleteReportDialog'
import { ReportLibrarySkeleton } from './components/ReportsSkeletons'
import { ScheduleReportModal } from './components/ScheduleReportModal'
import { useReportListParams } from './hooks/useReportListParams'
import {
  useLibrarySummary,
  useReportList,
  useReportsMutations,
} from './hooks/useReportsQueries'
import {
  categoryFilterOptions,
  exportFormatLabels,
  reportCategoryLabels,
  reportCategoryVariants,
} from './lib/labels'
import type { ReportListItem, ScheduleReportPayload } from './types'

export function ReportLibraryPage() {
  const navigate = useNavigate()
  const listParams = useReportListParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<ReportListItem | null>(null)
  const [renameTarget, setRenameTarget] = useState<ReportListItem | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [scheduleTarget, setScheduleTarget] = useState<ReportListItem | null>(
    null,
  )

  const { items, pagination, state, isSearching, refetch } = useReportList(
    listParams.params,
  )
  const { summary, isLoading: summaryLoading } = useLibrarySummary()

  const {
    deleteReport,
    duplicateReport,
    renameReport,
    runReport,
    exportReport,
    scheduleReport,
    isDeleting,
    isExporting,
    isScheduling,
  } = useReportsMutations({
    onDeleted: () => setPendingDelete(null),
    onDuplicated: (report) => {
      if (report) navigate(`/reports/${report.id}`)
    },
    onRenamed: () => setRenameTarget(null),
    onScheduled: () => setScheduleTarget(null),
  })

  function buildMenu(item: ReportListItem): DropdownMenuItem[] {
    return [
      {
        id: 'run',
        label: 'Run',
        icon: Play,
        onSelect: () => runReport.mutate(item.id),
      },
      {
        id: 'view',
        label: 'View',
        icon: Eye,
        onSelect: () => navigate(`/reports/${item.id}`),
      },
      {
        id: 'edit',
        label: 'Edit',
        icon: Pencil,
        onSelect: () => navigate(`/reports/builder/${item.id}`),
      },
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: Copy,
        onSelect: () => duplicateReport.mutate(item.id),
      },
      {
        id: 'export',
        label: 'Export',
        icon: Download,
        onSelect: () =>
          exportReport.mutate({
            id: item.id,
            format: item.formats[0] ?? 'PDF',
          }),
      },
      {
        id: 'rename',
        label: 'Rename',
        icon: Type,
        onSelect: () => {
          setRenameTarget(item)
          setRenameValue(item.name)
        },
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        tone: 'danger',
        onSelect: () => setPendingDelete(item),
      },
    ]
  }

  const columns: DataTableColumn<ReportListItem>[] = [
    {
      id: 'name',
      header: 'Report name',
      render: (row) => (
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-soft text-blue">
            <BarChart3 className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy">{row.name}</p>
            <p className="text-xs text-text-muted">
              Created {formatShortDate(row.createdAt)}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      render: (row) => (
        <Badge variant={reportCategoryVariants[row.category]}>
          {reportCategoryLabels[row.category]}
        </Badge>
      ),
    },
    {
      id: 'createdBy',
      header: 'Created by',
      className: 'hidden md:table-cell',
      render: (row) => (
        <span className="text-text-secondary">{row.createdBy}</span>
      ),
    },
    {
      id: 'lastRun',
      header: 'Last run',
      className: 'hidden lg:table-cell',
      render: (row) => (
        <span className="text-text-secondary">
          {row.lastRunAt ? formatDateTime(row.lastRunAt) : 'Never'}
        </span>
      ),
    },
    {
      id: 'format',
      header: 'Format',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.formats.map((format) => (
            <Badge key={format} variant="neutral">
              {exportFormatLabels[format]}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'w-12',
      render: (row) => (
        <div onClick={(event) => event.stopPropagation()}>
          <DropdownMenu
            triggerLabel={`Actions for ${row.name}`}
            trigger={<MoreHorizontal className="size-4" />}
            items={buildMenu(row)}
          />
        </div>
      ),
    },
  ]

  function handleSchedule(payload: ScheduleReportPayload) {
    if (!scheduleTarget) return
    scheduleReport.mutate({ reportId: scheduleTarget.id, payload })
  }

  return (
    <>
      <TopBar
        title="Report library"
        subtitle="Manage, run, and export your legal practice analytics."
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setFiltersOpen((value) => !value)}
            >
              <Filter className="size-4" />
              Filter
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={items.length === 0 || isExporting}
              onClick={() =>
                toast.info(
                  'Select a report',
                  'Use the row menu to export an individual report.',
                )
              }
            >
              <Download className="size-4" />
              Export all
            </Button>
            <Button size="sm" onClick={() => navigate('/reports/builder')}>
              <Plus className="size-4" />
              New report
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Reports', to: '/reports' },
            { label: 'Library' },
          ]}
        />

        <Card className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <SearchBar
                value={listParams.searchInput}
                onChange={listParams.setSearchInput}
                placeholder="Search reports, clients, or files…"
                ariaLabel="Search reports"
                searching={isSearching}
              />
            </div>
            {filtersOpen ? (
              <>
                <div className="w-full lg:w-48">
                  <Select
                    label="Category"
                    options={categoryFilterOptions}
                    value={listParams.category}
                    onChange={(event) =>
                      listParams.setCategory(
                        event.target.value as typeof listParams.category,
                      )
                    }
                  />
                </div>
                <div className="w-full lg:w-52">
                  <Select
                    label="Sort"
                    options={[
                      { value: 'createdAt:desc', label: 'Newest first' },
                      { value: 'createdAt:asc', label: 'Oldest first' },
                      { value: 'name:asc', label: 'Name A–Z' },
                      { value: 'name:desc', label: 'Name Z–A' },
                      { value: 'lastRunAt:desc', label: 'Recently run' },
                    ]}
                    value={listParams.sort}
                    onChange={(event) => listParams.setSort(event.target.value)}
                  />
                </div>
              </>
            ) : null}
            {listParams.hasActiveFilters ? (
              <Button size="sm" variant="ghost" onClick={listParams.reset}>
                Clear
              </Button>
            ) : null}
          </div>
        </Card>

        {state === 'loading' ? <ReportLibrarySkeleton /> : null}

        {state === 'error' ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load reports"
            description="Something went wrong while loading the report library."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : null}

        {state === 'empty' ? (
          listParams.hasActiveFilters ? (
            <EmptyState
              icon={Search}
              title="No matching reports"
              description="No saved reports match your current search and filters."
              action={
                <Button variant="secondary" onClick={listParams.reset}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="No reports yet"
              description="Create your first report to analyze revenue, cases, and practice performance."
              action={
                <Button onClick={() => navigate('/reports/builder')}>
                  <Plus className="size-4" />
                  New report
                </Button>
              }
            />
          )
        ) : null}

        {state === 'ready' ? (
          <Card className="overflow-hidden">
            <DataTable
              caption="Saved reports"
              columns={columns}
              rows={items}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/reports/${row.id}`)}
              empty={null}
            />
            {pagination ? (
              <Pagination
                page={pagination.page}
                pageSize={pagination.pageSize}
                total={pagination.total}
                totalPages={pagination.totalPages}
                onPageChange={listParams.setPage}
              />
            ) : null}
          </Card>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <LibraryMetric
            label="Monthly increase"
            value={
              summaryLoading
                ? '…'
                : summary?.monthlyIncreasePercent == null
                  ? '—'
                  : formatPercent(summary.monthlyIncreasePercent)
            }
          />
          <LibraryMetric
            label="Avg. processing time"
            value={
              summaryLoading
                ? '…'
                : summary?.averageProcessingSeconds == null
                  ? '—'
                  : `${summary.averageProcessingSeconds.toFixed(1)}s`
            }
          />
          <LibraryMetric
            label="Shared with partners"
            value={
              summaryLoading
                ? '…'
                : summary?.sharedWithPartners == null
                  ? '—'
                  : formatCount(summary.sharedWithPartners)
            }
          />
        </div>
      </div>

      <DeleteReportDialog
        open={pendingDelete !== null}
        reportName={pendingDelete?.name ?? ''}
        deleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteReport.mutate(pendingDelete.id)
        }}
      />

      <Modal
        open={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        title="Rename report"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              loading={renameReport.isPending}
              onClick={() => {
                if (!renameTarget || !renameValue.trim()) return
                renameReport.mutate({
                  id: renameTarget.id,
                  name: renameValue.trim(),
                })
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <Input
          label="Report name"
          value={renameValue}
          onChange={(event) => setRenameValue(event.target.value)}
          required
        />
      </Modal>

      <ScheduleReportModal
        open={scheduleTarget !== null}
        reportName={scheduleTarget?.name}
        saving={isScheduling}
        onClose={() => setScheduleTarget(null)}
        onSave={handleSchedule}
      />
    </>
  )
}

function LibraryMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex size-10 items-center justify-center rounded-full bg-blue-soft text-blue">
        <BarChart3 className="size-4" />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </p>
        <p className="font-display text-2xl text-navy">{value}</p>
      </div>
    </Card>
  )
}
