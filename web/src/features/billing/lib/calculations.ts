import type { InvoiceItem } from '../types'

export interface LineTotals {
  lineSubtotal: number
  discountAmount: number
  taxable: number
  taxAmount: number
  lineTotal: number
}

export interface InvoiceTotals {
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function computeLineTotals(item: {
  quantity: number
  rate: number
  taxRate: number
  discountRate: number
}): LineTotals {
  const lineSubtotal = roundMoney(item.quantity * item.rate)
  const discountAmount = roundMoney(lineSubtotal * (item.discountRate / 100))
  const taxable = roundMoney(lineSubtotal - discountAmount)
  const taxAmount = roundMoney(taxable * (item.taxRate / 100))
  const lineTotal = roundMoney(taxable + taxAmount)

  return { lineSubtotal, discountAmount, taxable, taxAmount, lineTotal }
}

export function computeInvoiceTotals(
  items: Array<{
    quantity: number
    rate: number
    taxRate: number
    discountRate: number
  }>,
): InvoiceTotals {
  return items.reduce<InvoiceTotals>(
    (acc, item) => {
      const line = computeLineTotals(item)
      return {
        subtotal: roundMoney(acc.subtotal + line.lineSubtotal),
        discountAmount: roundMoney(acc.discountAmount + line.discountAmount),
        taxAmount: roundMoney(acc.taxAmount + line.taxAmount),
        total: roundMoney(acc.total + line.lineTotal),
      }
    },
    { subtotal: 0, discountAmount: 0, taxAmount: 0, total: 0 },
  )
}

export function withComputedAmount(
  item: Omit<InvoiceItem, 'amount'> & { amount?: number },
): InvoiceItem {
  return {
    ...item,
    amount: computeLineTotals(item).lineTotal,
  }
}
