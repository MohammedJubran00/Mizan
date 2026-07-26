import { CircleDollarSign } from 'lucide-react'

import { Card } from '@/shared/components/Card'
import { formatMoney } from '@/shared/lib/utils'

import type { CurrencyCode, Discount, Tax } from '../types'

interface BalanceOverviewProps {
  subtotal: number
  tax: Tax
  discount: Discount
  total: number
  amountPaid: number
  balanceDue: number
  currency: CurrencyCode
}

export function BalanceOverview({
  subtotal,
  tax,
  discount,
  total,
  amountPaid,
  balanceDue,
  currency,
}: BalanceOverviewProps) {
  return (
    <Card className="overflow-hidden bg-navy p-5 text-white">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Balance overview</h2>
        <CircleDollarSign className="size-5 text-white/70" />
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-white/70">Subtotal</dt>
          <dd>{formatMoney(subtotal, currency)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/70">Tax ({tax.rate}%)</dt>
          <dd>{formatMoney(tax.amount, currency)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/70">Discount ({discount.rate}%)</dt>
          <dd>{formatMoney(discount.amount, currency)}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-white/15 pt-3">
          <dt className="font-semibold">Grand total</dt>
          <dd className="font-display text-2xl">
            {formatMoney(total, currency)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/70">Paid</dt>
          <dd>{formatMoney(amountPaid, currency)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/70">Balance due</dt>
          <dd className="font-semibold">{formatMoney(balanceDue, currency)}</dd>
        </div>
      </dl>
    </Card>
  )
}
