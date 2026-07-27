import {
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  RefreshCcw,
  Trash2,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { Avatar } from '@/shared/components/Avatar'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Checkbox } from '@/shared/components/Checkbox'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'
import { Pagination } from '@/shared/components/Pagination'
import type { useRowSelection } from '@/shared/hooks/useRowSelection'
import { formatCount, formatShortDate } from '@/shared/lib/utils'

import { practiceAreaLabels } from '../lib/labels'
import type { CaseListItem, CasePagination } from '../types'
import { CaseCard } from './CaseCard'
import { PriorityBadge } from './PriorityBadge'
import { StatusBadge } from './StatusBadge'

type Selection = ReturnType<typeof useRowSelection>

interface CaseTableProps {
  items: CaseListItem[]
  selection: Selection
  pagination?: CasePagination
  empty: ReactNode
  onPageChange: (page: number) => void
  onOpen: (item: CaseListItem) => void
  onEdit: (item: CaseListItem) => void
  onChangeStatus: (item: CaseListItem) => void
  onDelete: (item: CaseListItem) => void
  onBulkExport: () => void
  onBulkDelete: () => void
}

export function CaseTable({
  items,
  selection,
  pagination,
  empty,
  onPageChange,
  onOpen,
  onEdit,
  onChangeStatus,
  onDelete,
  onBulkExport,
  onBulkDelete,
}: CaseTableProps) {
  if (items.length === 0) return <>{empty}</>

  function buildMenu(item: CaseListItem): DropdownMenuItem[] {
    return [
      { id: 'view', label: 'View case', icon: Eye, onSelect: () => onOpen(item) },
      { id: 'edit', label: 'Edit case', icon: Pencil, onSelect: () => onEdit(item) },
      {
        id: 'status',
        label: 'Change status',
        icon: RefreshCcw,
        onSelect: () => onChangeStatus(item),
      },
      {
        id: 'delete',
        label: 'Delete case',
        icon: Trash2,
        tone: 'danger',
        onSelect: () => onDelete(item),
      },
    ]
  }

  const columns: DataTableColumn<CaseListItem>[] = [
    {
      id: 'select',
      header: (
        <Checkbox
          checked={selection.allSelected}
          indeterminate={selection.someSelected}
          onChange={selection.toggleAll}
          aria-label={
            selection.allSelected ? 'Clear selection' : 'Select all cases on this page'
          }
        />
      ),
      className: 'w-10',
      render: (row) => (
        <div onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={selection.isSelected(row.id)}
            onChange={() => selection.toggle(row.id)}
            aria-label={`Select case ${row.caseNumber}`}
          />
        </div>
      ),
    },
    {
      id: 'case',
      header: 'Case info',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-mono text-xs text-blue">{row.caseNumber}</p>
          <p className="truncate font-semibold text-navy">{row.title}</p>
        </div>
      ),
    },
    {
      id: 'client',
      header: 'Client',
      render: (row) =>
        row.client ? (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={row.client.fullName} size="sm" />
            <span className="truncate text-text-secondary">
              {row.client.fullName}
            </span>
          </div>
        ) : (
          <span className="text-xs text-text-muted">Unassigned</span>
        ),
    },
    {
      id: 'practiceArea',
      header: 'Practice area',
      render: (row) => (
        <span className="text-text-secondary">
          {practiceAreaLabels[row.practiceArea] ?? row.practiceArea}
        </span>
      ),
    },
    {
      id: 'lawyer',
      header: 'Assigned lawyer',
      render: (row) =>
        row.leadLawyer ? (
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="truncate text-text-secondary">
              {row.leadLawyer.fullName}
            </span>
            {row.isLeadAssigned ? <Badge variant="accent">Lead</Badge> : null}
          </div>
        ) : (
          <span className="text-xs text-text-muted">Unassigned</span>
        ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={row.status} />
          <PriorityBadge priority={row.priority} />
        </div>
      ),
    },
    {
      id: 'nextHearing',
      header: 'Next hearing',
      render: (row) =>
        row.nextHearingAt ? (
          <span className="text-text-secondary">
            {formatShortDate(row.nextHearingAt)}
          </span>
        ) : (
          <span className="text-xs text-text-muted">TBD</span>
        ),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-16 text-right',
      render: (row) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
          <DropdownMenu
            triggerLabel={`Actions for ${row.caseNumber}`}
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
                Export selected
              </Button>
              <Button size="sm" variant="danger" onClick={onBulkDelete}>
                <Trash2 className="size-4" />
                Delete selected
              </Button>
              <Button size="sm" variant="ghost" onClick={selection.clear}>
                Clear
              </Button>
            </div>
          </>
        ) : (
          <h2 className="text-sm font-semibold text-navy">
            {pagination
              ? `${formatCount(pagination.total)} ${pagination.total === 1 ? 'case' : 'cases'}`
              : 'Cases'}
          </h2>
        )}
      </div>

      <div className="hidden md:block">
        <DataTable
          caption="Case list"
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
            <CaseCard
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
