import { AlertTriangle, CreditCard, Receipt, Wallet } from 'lucide-react'

import { InvoiceTable } from '@/shared/components/InvoiceTable'
import { MetricCard } from '@/shared/components/MetricCard'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatMoney } from '@/shared/lib/utils'

import type { CaseBillingSummary } from '../../types'

export function BillingTab({ billing }: { billing: CaseBillingSummary }) {
  const { payments } = billing

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total billed"
          value={formatMoney(billing.totalBilled, payments.currency)}
          icon={CreditCard}
        />
        <MetricCard
          label="Payments received"
          value={formatMoney(payments.totalPaid, payments.currency)}
          icon={Wallet}
          tone="success"
        />
        <MetricCard
          label="Outstanding"
          value={formatMoney(payments.outstanding, payments.currency)}
          icon={AlertTriangle}
          tone={payments.outstanding > 0 ? 'danger' : 'default'}
        />
      </div>

      <SectionCard title="Invoices" icon={Receipt} bodyClassName="px-2 py-2">
        <InvoiceTable
          invoices={billing.invoices}
          caption="Invoices raised for this matter"
          emptyDescription="Invoices raised against this matter will appear here with their payment status."
        />
      </SectionCard>
    </div>
  )
}
