import { FileText } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { formatMoney } from '@/shared/lib/utils'

import type { CurrencyCode } from '../types'

interface InvoiceSummaryProps {
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  currency: CurrencyCode | ''
  remittanceNote?: string
  previewing?: boolean
  onPreviewPdf?: () => void
  onCancel?: () => void
}

export function InvoiceSummary({
  subtotal,
  taxAmount,
  discountAmount,
  total,
  currency,
  remittanceNote = 'Payments are processed according to the selected terms. Net terms apply once the invoice is sent.',
  previewing,
  onPreviewPdf,
  onCancel,
}: InvoiceSummaryProps) {
  const code = currency || 'USD'

  return (
    <Card className="space-y-4 p-5">
      <h2 className="text-sm font-semibold text-navy">Invoice summary</h2>

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-text-muted">Subtotal</dt>
          <dd className="font-medium text-navy">{formatMoney(subtotal, code)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-text-muted">Tax</dt>
          <dd className="font-medium text-navy">
            {formatMoney(taxAmount, code)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-text-muted">Discount</dt>
          <dd className="font-medium text-navy">
            {formatMoney(discountAmount, code)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Total amount
          </dt>
          <dd className="font-display text-2xl text-blue">
            {formatMoney(total, code)}
          </dd>
        </div>
      </dl>

      <div className="rounded-xl border border-border-subtle bg-surface-muted/50 p-3">
        <div className="flex gap-2">
          <FileText className="mt-0.5 size-4 shrink-0 text-blue" />
          <p className="text-xs leading-relaxed text-text-secondary">
            {remittanceNote}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {onPreviewPdf ? (
          <Button
            variant="secondary"
            onClick={onPreviewPdf}
            loading={previewing}
            className="w-full"
          >
            <FileText className="size-4" />
            Preview PDF
          </Button>
        ) : null}
        {onCancel ? (
          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full text-danger hover:bg-danger/10"
          >
            Cancel draft
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
