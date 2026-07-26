import { Receipt } from 'lucide-react'

import { InvoiceTable } from '@/shared/components/InvoiceTable'
import { SectionCard } from '@/shared/components/SectionCard'
import type { Invoice } from '@/shared/types/billing'

export function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
  return (
    <SectionCard title="Invoices" icon={Receipt} bodyClassName="px-2 py-2">
      <InvoiceTable
        invoices={invoices}
        caption="Invoices issued to this client"
        emptyDescription="Invoices raised for this client will appear here with their payment status."
      />
    </SectionCard>
  )
}
