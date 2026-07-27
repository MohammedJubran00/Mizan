import { Wallet } from 'lucide-react'

import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/EmptyState'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatMoney, formatShortDate } from '@/shared/lib/utils'

import {
  paymentMethodLabels,
  paymentStatusLabels,
  paymentStatusVariants,
} from '../../lib/labels'
import type { CurrencyCode, Payment } from '../../types'

interface PaymentsTabProps {
  payments: Payment[]
  currency: CurrencyCode
  onRecordPayment: () => void
  onRefund: (payment: Payment) => void
}

export function PaymentsTab({
  payments,
  currency,
  onRecordPayment,
  onRefund,
}: PaymentsTabProps) {
  const columns: DataTableColumn<Payment>[] = [
    {
      id: 'date',
      header: 'Date',
      render: (row) => (
        <span className="text-text-secondary">
          {formatShortDate(row.paymentDate)}
        </span>
      ),
    },
    {
      id: 'method',
      header: 'Method',
      render: (row) => (
        <span className="text-text-secondary">
          {paymentMethodLabels[row.method]}
        </span>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (row) => (
        <span className="font-semibold text-navy">
          {formatMoney(row.amount, row.currency || currency)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={paymentStatusVariants[row.status]}>
          {paymentStatusLabels[row.status]}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      render: (row) => (
        <Button
          size="sm"
          variant="ghost"
          disabled={row.status === 'REFUNDED'}
          onClick={() => onRefund(row)}
        >
          Refund
        </Button>
      ),
    },
  ]

  return (
    <SectionCard
      title="Payments"
      icon={Wallet}
      action={
        <Button size="sm" onClick={onRecordPayment}>
          Record payment
        </Button>
      }
      bodyClassName="px-2 py-2"
    >
      <DataTable
        caption="Payments against this invoice"
        columns={columns}
        rows={payments}
        rowKey={(row) => row.id}
        empty={
          <EmptyState
            icon={Wallet}
            title="No payments recorded"
            description="Record a payment to start tracking collections against this invoice."
            action={
              <Button size="sm" onClick={onRecordPayment}>
                Record payment
              </Button>
            }
            className="border-0 py-10"
          />
        }
      />
    </SectionCard>
  )
}
