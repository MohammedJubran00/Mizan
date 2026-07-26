import { Receipt } from 'lucide-react'

import { Card } from '@/shared/components/Card'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/EmptyState'
import { formatMoney } from '@/shared/lib/utils'

import type { CurrencyCode, InvoiceItem } from '../types'

interface InvoiceItemsTableProps {
  items: InvoiceItem[]
  currency: CurrencyCode
}

export function InvoiceItemsTable({ items, currency }: InvoiceItemsTableProps) {
  const columns: DataTableColumn<InvoiceItem>[] = [
    {
      id: 'description',
      header: 'Description',
      render: (row) => (
        <span className="font-medium text-navy">{row.description}</span>
      ),
    },
    {
      id: 'qty',
      header: 'Qty',
      className: 'text-right',
      render: (row) => (
        <span className="text-text-secondary">{row.quantity}</span>
      ),
    },
    {
      id: 'rate',
      header: 'Rate',
      className: 'text-right',
      render: (row) => (
        <span className="text-text-secondary">
          {formatMoney(row.rate, currency)}
        </span>
      ),
    },
    {
      id: 'tax',
      header: 'Tax',
      className: 'text-right',
      render: (row) => (
        <span className="text-text-secondary">{row.taxRate}%</span>
      ),
    },
    {
      id: 'total',
      header: 'Total',
      className: 'text-right',
      render: (row) => (
        <span className="font-semibold text-navy">
          {formatMoney(row.amount, currency)}
        </span>
      ),
    },
  ]

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-navy">Services rendered</h2>
      </div>
      <DataTable
        caption="Invoice line items"
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        empty={
          <EmptyState
            icon={Receipt}
            title="No line items"
            description="Line items for this invoice will appear here."
            className="border-0 py-10"
          />
        }
      />
    </Card>
  )
}
