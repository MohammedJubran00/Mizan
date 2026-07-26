import {
  CalendarClock,
  ClipboardCheck,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Printer,
  Trash2,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Checkbox } from '@/shared/components/Checkbox'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'
import { Pagination } from '@/shared/components/Pagination'
import type { useRowSelection } from '@/shared/hooks/useRowSelection'
import { formatCount, formatShortDate, formatTime } from '@/shared/lib/utils'

import { hearingTypeLabels } from '../lib/labels'
import type { HearingListItem, HearingPagination } from '../types'
import { HearingCard } from './HearingCard'
import { HearingStatusBadge } from './HearingStatusBadge'

type Selection = ReturnType<typeof useRowSelection>

interface HearingsTableProps {
  items: HearingListItem[]
  selection: Selection
  pagination?: HearingPagination
  empty: ReactNode
  onPageChange: (page: number) => void
  onOpen: (item: HearingListItem) => void
  onEdit: (item: HearingListItem) => void
  onDelete: (item: HearingListItem) => void
  onReschedule: (item: HearingListItem) => void
  onPrint: (item: HearingListItem) => void
  onUpdateOutcome: (item: HearingListItem) => void
  onBulkExport: () => void
  onBulkDelete: () => void
  onBulkPrint: () => void
}

export function HearingsTable({
  items,
  selection,
  pagination,
  empty,
  onPageChange,
  onOpen,
  onEdit,
  onDelete,
  onReschedule,
  onPrint,
  onUpdateOutcome,
  onBulkExport,
  onBulkDelete,
  onBulkPrint,
}: HearingsTableProps) {
  if (items.length === 0) return <>{empty}</>

  function buildMenu(item: HearingListItem): DropdownMenuItem[] {
    return [
      { id: 'view', label: 'View', icon: Eye, onSelect: () => onOpen(item) },
      { id: 'edit', label: 'Edit', icon: Pencil, onSelect: () => onEdit(item) },
      {
        id: 'reschedule',
        label: 'Reschedule',
        icon: CalendarClock,
        onSelect: () => onReschedule(item),
      },
      {
        id: 'outcome',
        label: 'Update outcome',
        icon: ClipboardCheck,
        onSelect: () => onUpdateOutcome(item),
      },
      {
        id: 'print',
        label: 'Print',
        icon: Printer,
        onSelect: () => onPrint(item),
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        tone: 'danger',
        onSelect: () => onDelete(item),
      },
    ]
  }

  const columns: DataTableColumn<HearingListItem>[] = [
    {
      id: 'select',
      header: (
        <Checkbox
          checked={selection.allSelected}
          indeterminate={selection.someSelected}
          onChange={selection.toggleAll}
          aria-label={
            selection.allSelected
              ? 'Clear selection'
              : 'Select all hearings on this page'
          }
        />
      ),
      className: 'w-10',
      render: (row) => (
        <div onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={selection.isSelected(row.id)}
            onChange={() => selection.toggle(row.id)}
            aria-label={`Select hearing on ${formatShortDate(row.scheduledAt)}`}
          />
        </div>
      ),
    },
    {
      id: 'when',
      header: 'Date & time',
      render: (row) => (
        <div>
          <p className="font-semibold text-navy">{formatShortDate(row.scheduledAt)}</p>
          <p className="text-xs text-text-muted">{formatTime(row.scheduledAt)}</p>
        </div>
      ),
    },
    {
      id: 'case',
      header: 'Case',
      render: (row) =>
        row.caseRef ? (
          <div className="min-w-0">
            <p className="font-mono text-xs text-blue">{row.caseRef.caseNumber}</p>
            <p className="truncate text-sm text-text-secondary">{row.caseRef.title}</p>
          </div>
        ) : (
          <span className="text-xs text-text-muted">Unlinked</span>
        ),
    },
    {
      id: 'client',
      header: 'Client',
      render: (row) => (
        <span className="text-text-secondary">
          {row.client?.fullName ?? '—'}
        </span>
      ),
    },
    {
      id: 'court',
      header: 'Court & judge',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-text-secondary">{row.court ?? '—'}</p>
          <p className="truncate text-xs text-text-muted">
            {row.judgeName ?? 'Judge TBD'}
          </p>
        </div>
      ),
    },
    {
      id: 'lawyer',
      header: 'Lawyer',
      render: (row) => (
        <span className="text-text-secondary">
          {row.leadLawyer?.fullName ?? 'Unassigned'}
        </span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      render: (row) => (
        <Badge variant="neutral">{hearingTypeLabels[row.type]}</Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => <HearingStatusBadge status={row.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-16 text-right',
      render: (row) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
          <DropdownMenu
            triggerLabel={`Actions for hearing on ${formatShortDate(row.scheduledAt)}`}
            trigger={<MoreHorizontal className="size-4" />}
            items={buildMenu(row)}
          />
        </div>
      ),
    },
  ]

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
        {selection.count > 0 ? (
          <>
            <p className="text-sm font-semibold text-navy" aria-live="polite">
              {formatCount(selection.count)} selected
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" onClick={onBulkExport}>
                <Download className="size-4" />
                Export
              </Button>
              <Button size="sm" variant="secondary" onClick={onBulkPrint}>
                <Printer className="size-4" />
                Print
              </Button>
              <Button size="sm" variant="danger" onClick={onBulkDelete}>
                <Trash2 className="size-4" />
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={selection.clear}>
                Clear
              </Button>
            </div>
          </>
        ) : (
          <h2 className="text-sm font-semibold text-navy">
            {pagination
              ? `${formatCount(pagination.total)} ${pagination.total === 1 ? 'hearing' : 'hearings'}`
              : 'Hearings'}
          </h2>
        )}
      </div>

      <div className="hidden md:block">
        <DataTable
          caption="Hearings list"
          columns={columns}
          rows={items}
          rowKey={(row) => row.id}
          onRowClick={onOpen}
          rowClassName={(row) =>
            selection.isSelected(row.id) ? 'bg-blue-soft/50' : undefined
          }
          empty={null}
        />
      </div>

      <ul className="space-y-3 p-3 md:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <HearingCard
              item={item}
              selected={selection.isSelected(item.id)}
              onToggleSelect={() => selection.toggle(item.id)}
              onOpen={() => onOpen(item)}
              menuItems={buildMenu(item)}
            />
          </li>
        ))}
      </ul>

      {pagination ? (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      ) : null}
    </Card>
  )
}
