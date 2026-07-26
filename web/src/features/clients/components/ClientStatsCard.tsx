import { AlertTriangle, Briefcase, CheckCircle2, Wallet } from 'lucide-react'

import { MetricCard } from '@/shared/components/MetricCard'
import { formatCount, formatMoney } from '@/shared/lib/utils'

import type { ClientCaseStats, PaymentSummary } from '../types'

interface ClientStatsGridProps {
  stats: ClientCaseStats
  payments: PaymentSummary
}

export function ClientStatsGrid({ stats, payments }: ClientStatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Active Cases"
        value={formatCount(stats.activeCases)}
        icon={Briefcase}
      />
      <MetricCard
        label="Closed Cases"
        value={formatCount(stats.closedCases)}
        icon={CheckCircle2}
      />
      <MetricCard
        label="Total Payments"
        value={formatMoney(payments.totalPaid, payments.currency)}
        icon={Wallet}
      />
      <MetricCard
        label="Outstanding"
        value={formatMoney(payments.outstanding, payments.currency)}
        icon={AlertTriangle}
        tone={payments.outstanding > 0 ? 'danger' : 'default'}
      />
    </div>
  )
}
