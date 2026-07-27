import {
  AlertTriangle,
  Banknote,
  CircleDollarSign,
  Receipt,
  Wallet,
} from 'lucide-react'

import { Badge } from '@/shared/components/Badge'
import { Card } from '@/shared/components/Card'
import { MetricCard } from '@/shared/components/MetricCard'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatCount, formatMoney, formatPercent } from '@/shared/lib/utils'

import type { BillingSummary } from '../types'

interface BillingStatsProps {
  summary: BillingSummary | null
  loading: boolean
}

const NO_VALUE = '—'

export function BillingStats({ summary, loading }: BillingStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="space-y-3 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-28" />
          </Card>
        ))}
      </div>
    )
  }

  const currency = summary?.currency ?? 'USD'

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        label="Total revenue"
        value={
          summary ? formatMoney(summary.totalRevenue, currency) : NO_VALUE
        }
        icon={CircleDollarSign}
        hint={
          summary
            ? 'Collected across paid invoices'
            : 'Available once billing data is connected'
        }
      />
      <MetricCard
        label="Outstanding balance"
        value={
          summary
            ? formatMoney(summary.outstandingBalance, currency)
            : NO_VALUE
        }
        icon={Wallet}
        tone={
          summary && summary.outstandingBalance > 0 ? 'warning' : 'default'
        }
        action={
          summary && summary.urgentOutstandingCount > 0 ? (
            <Badge variant="danger">
              {formatCount(summary.urgentOutstandingCount)} urgent
            </Badge>
          ) : undefined
        }
      />
      <MetricCard
        label="Paid invoices"
        value={summary ? formatCount(summary.paidInvoiceCount) : NO_VALUE}
        icon={Receipt}
        hint={
          summary
            ? `${formatPercent(summary.paidProgress ?? 0)} of issued invoices`
            : undefined
        }
      />
      <MetricCard
        label="Overdue invoices"
        value={
          summary ? formatCount(summary.overdueInvoiceCount) : NO_VALUE
        }
        icon={AlertTriangle}
        tone={
          summary && summary.overdueInvoiceCount > 0 ? 'danger' : 'default'
        }
      />
      <MetricCard
        label="Payments this month"
        value={
          summary
            ? formatMoney(summary.paymentsThisMonth, currency)
            : NO_VALUE
        }
        icon={Banknote}
      />
    </div>
  )
}
