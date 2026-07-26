import { Briefcase, Landmark } from 'lucide-react'

import { SectionCard } from '@/shared/components/SectionCard'

interface OverviewTabProps {
  paymentInstructions?: string | null
  caseSummary?: string | null
}

export function OverviewExtras({
  paymentInstructions,
  caseSummary,
}: OverviewTabProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard title="Payment instructions" icon={Landmark}>
        <p className="text-sm leading-relaxed text-text-secondary">
          {paymentInstructions?.trim() ||
            'Payment instructions will appear here once added to the invoice.'}
        </p>
      </SectionCard>
      <SectionCard title="Case summary" icon={Briefcase}>
        <p className="text-sm leading-relaxed text-text-secondary">
          {caseSummary?.trim() ||
            'Case context for this invoice will appear here when provided.'}
        </p>
      </SectionCard>
    </div>
  )
}
