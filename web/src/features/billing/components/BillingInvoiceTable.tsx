import {
  Ban,
  Copy,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

import { Avatar } from '@/shared/components/Avatar'
import { Badge } from '@/shared/components/Badge'
import { Card } from '@/shared/components/Card'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'
import { Pagination } from '@/shared/components/Pagination'
import { formatMoney, formatShortDate } from '@/shared/lib/utils'

import { invoiceStatusLabels, invoiceStatusVariants } from '../lib/labels'
import type { BillingPagination, InvoiceListItem } from '../types'

interface BillingInvoiceTableProps {
  items: InvoiceListItem[]
  pagination?: BillingPagination
  empty: ReactNode
  headerAction?: ReactNode
  onPageChange: (page: number) => void
  onView: (item: InvoiceListItem) => void
  onEdit: (item: InvoiceListItem) => void
  onDuplicate: (item: InvoiceListItem) => void
  onDownload: (item: InvoiceListItem) => void
  onSend: (item: InvoiceListItem) => void
  onMarkPaid: (item: InvoiceListItem) => void
  onVoid: (item: InvoiceListItem) => void
  onDelete: (item: InvoiceListItem) => void
}

export function BillingInvoiceTable({
  items,
  pagination,
  empty,
  headerAction,
  onPageChange,
  onView,
  onEdit,
  onDuplicate,
  onDownload,
  onSend,
  onMarkPaid,
  onVoid,
  onDelete,
}: BillingInvoiceTableProps) {
  if (items.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
          <h2 className="text-sm font-semibold text-navy">Recent invoices</h2>
          {headerAction}
        </div>
        {empty}
      </Card>
    )
  }

  function buildMenu(item: InvoiceListItem): DropdownMenuItem[] {
    const canCollect = item.status !== 'PAID' && item.status !== 'VOID'
    const canEdit = item.status === 'DRAFT' || item.status === 'SENT'

    return [
      {
        id: 'view',
        label: 'View',
        icon: Eye,
        onSelect: () => onView(item),
      },
      {
        id: 'edit',
        label: 'Edit',
        icon: Pencil,
        disabled: !canEdit,
        onSelect: () => onEdit(item),
      },
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: Copy,
        onSelect: () => onDuplicate(item),
      },
      {
        id: 'download',
        label: 'Download PDF',
        icon: Download,
        onSelect: () => onDownload(item),
      },
      {
        id: 'send',
        label: 'Send',
        icon: Send,
        disabled: item.status === 'VOID',
        onSelect: () => onSend(item),
      },
      {
        id: 'paid',
        label: 'Mark paid',
        icon: Wallet,
        disabled: !canCollect,
        onSelect: () => onMarkPaid(item),
      },
      {
        id: 'void',
        label: 'Void invoice',
        icon: Ban,
        disabled: item.status === 'VOID' || item.status === 'PAID',
        onSelect: () => onVoid(item),
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

  const columns: DataTableColumn<InvoiceListItem>[] = [
    {
      id: 'number',
      header: 'Invoice #',
      render: (row) => (
        <Link
          to={`/billing/invoices/${row.id}`}
          className="font-semibold text-blue hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15"
          onClick={(event) => event.stopPropagation()}
        >
          {row.number}
        </Link>
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
          <span className="text-text-muted">—</span>
        ),
    },
    {
      id: 'case',
      header: 'Related case',
      className: 'hidden lg:table-cell',
      render: (row) =>
        row.relatedCase ? (
          <div className="min-w-0">
            <p className="truncate text-sm text-text-secondary">
              {row.relatedCase.title}
            </p>
            <p className="font-mono text-xs text-text-muted">
              {row.relatedCase.caseNumber}
            </p>
          </div>
        ) : (
          <span className="text-text-muted">—</span>
        ),
    },
    {
      id: 'issued',
      header: 'Issue date',
      className: 'hidden md:table-cell',
      render: (row) => (
        <span className="text-text-secondary">
          {formatShortDate(row.issueDate)}
        </span>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (row) => (
        <span className="font-semibold text-navy">
          {formatMoney(row.amount, row.currency)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={invoiceStatusVariants[row.status]}>
          {invoiceStatusLabels[row.status]}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'w-12',
      render: (row) => (
        <div onClick={(event) => event.stopPropagation()}>
          <DropdownMenu
            triggerLabel={`Actions for ${row.number}`}
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
        <h2 className="text-sm font-semibold text-navy">Recent invoices</h2>
        {headerAction}
      </div>
      <DataTable
        caption="Recent invoices"
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        onRowClick={onView}
        empty={null}
      />
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
