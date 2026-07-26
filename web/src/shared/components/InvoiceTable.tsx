import { Receipt } from 'lucide-react'

import { Badge } from '@/shared/components/Badge'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/EmptyState'
import { invoiceStatusLabels, invoiceStatusVariants } from '@/shared/lib/billing'
import { formatMoney, formatShortDate } from '@/shared/lib/utils'
import type { Invoice } from '@/shared/types/billing'

const columns: DataTableColumn<Invoice>[] = [
  {
    id: 'number',
    header: 'Invoice',
    render: (row) => <span className="font-semibold text-navy">{row.number}</span>,
  },
  {
    id: 'issued',
    header: 'Issued',
    render: (row) => (
      <span className="text-text-secondary">{formatShortDate(row.issuedAt)}</span>
    ),
  },
  {
    id: 'due',
    header: 'Due',
    render: (row) => (
      <span className="text-text-secondary">
        {row.dueAt ? formatShortDate(row.dueAt) : '—'}
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
]

interface InvoiceTableProps {
  invoices: Invoice[]
  caption: string
  emptyDescription: string
}

export function InvoiceTable({
  invoices,
  caption,
  emptyDescription,
}: InvoiceTableProps) {
  return (
    <DataTable
      caption={caption}
      columns={columns}
      rows={invoices}
      rowKey={(row) => row.id}
      empty={
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description={emptyDescription}
          className="border-0 py-10"
        />
      }
    />
  )
}
