import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { Select } from '@/shared/components/Select'
import { Textarea } from '@/shared/components/Textarea'
import { formatMoney } from '@/shared/lib/utils'

import { billingService } from '../api/billingService'
import {
  emptyPaymentFormValues,
  paymentMethodOptions,
  toPaymentPayload,
  validatePaymentForm,
  type PaymentFormErrors,
  type PaymentFormValues,
} from '../lib/paymentForm'
import type { InvoiceListItem } from '../types'

interface RecordPaymentModalProps {
  open: boolean
  recording: boolean
  /** Prefill when recording against a known invoice. */
  initialInvoice?: InvoiceListItem | null
  onClose: () => void
  onRecord: (values: ReturnType<typeof toPaymentPayload>) => void
}

export function RecordPaymentModal({
  open,
  recording,
  initialInvoice = null,
  onClose,
  onRecord,
}: RecordPaymentModalProps) {
  const [values, setValues] = useState<PaymentFormValues>(emptyPaymentFormValues)
  const [errors, setErrors] = useState<PaymentFormErrors>({})
  const [attempted, setAttempted] = useState(false)
  const [invoiceOptions, setInvoiceOptions] = useState<InvoiceListItem[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  useEffect(() => {
    if (!open) return

    setValues({
      ...emptyPaymentFormValues,
      paymentDate: new Date().toISOString().slice(0, 10),
      invoiceId: initialInvoice?.id ?? '',
      invoiceLabel: initialInvoice
        ? `${initialInvoice.number} — ${formatMoney(initialInvoice.amount, initialInvoice.currency)}`
        : '',
      amount: initialInvoice ? String(initialInvoice.amount) : '',
    })
    setErrors({})
    setAttempted(false)

    let cancelled = false
    setLoadingInvoices(true)
    billingService
      .getOutstandingInvoices()
      .then((items) => {
        if (!cancelled) setInvoiceOptions(items)
      })
      .finally(() => {
        if (!cancelled) setLoadingInvoices(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, initialInvoice])

  const selectedInvoice = useMemo(() => {
    if (initialInvoice && initialInvoice.id === values.invoiceId) {
      return initialInvoice
    }
    return invoiceOptions.find((item) => item.id === values.invoiceId) ?? null
  }, [initialInvoice, invoiceOptions, values.invoiceId])

  const selectOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of invoiceOptions) {
      map.set(
        item.id,
        `${item.number} — ${item.client?.fullName ?? 'Client'} (${formatMoney(item.amount, item.currency)})`,
      )
    }
    if (initialInvoice && !map.has(initialInvoice.id)) {
      map.set(
        initialInvoice.id,
        `${initialInvoice.number} — ${initialInvoice.client?.fullName ?? 'Client'} (${formatMoney(initialInvoice.amount, initialInvoice.currency)})`,
      )
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
  }, [invoiceOptions, initialInvoice])

  function update<K extends keyof PaymentFormValues>(
    field: K,
    value: PaymentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }
  }

  function submit() {
    const nextErrors = validatePaymentForm(values, selectedInvoice?.amount)
    setErrors(nextErrors)
    setAttempted(true)
    if (Object.keys(nextErrors).length > 0) return
    onRecord(toPaymentPayload(values))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record payment"
      description="Match a payment to an outstanding invoice."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={recording}>
            Cancel
          </Button>
          <Button onClick={submit} loading={recording}>
            Record Payment
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Select
            label="Invoice"
            required
            options={selectOptions}
            placeholder={
              loadingInvoices
                ? 'Loading outstanding invoices…'
                : 'Select an invoice…'
            }
            value={values.invoiceId}
            onChange={(event) => {
              const invoice = invoiceOptions.find(
                (item) => item.id === event.target.value,
              )
              update('invoiceId', event.target.value)
              if (invoice) {
                update('amount', String(invoice.amount))
              }
            }}
            error={attempted ? errors.invoiceId : undefined}
            disabled={Boolean(initialInvoice) || loadingInvoices}
            hint={
              selectOptions.length === 0 && !loadingInvoices
                ? 'No outstanding invoices are available yet.'
                : undefined
            }
          />
        </div>
        <Input
          label="Payment date"
          type="date"
          required
          value={values.paymentDate}
          onChange={(event) => update('paymentDate', event.target.value)}
          error={attempted ? errors.paymentDate : undefined}
        />
        <Select
          label="Payment method"
          required
          options={paymentMethodOptions}
          placeholder="Select a method…"
          value={values.method}
          onChange={(event) =>
            update('method', event.target.value as PaymentFormValues['method'])
          }
          error={attempted ? errors.method : undefined}
        />
        <Input
          label="Amount"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          required
          value={values.amount}
          onChange={(event) => update('amount', event.target.value)}
          error={attempted ? errors.amount : undefined}
          hint={
            selectedInvoice
              ? `Outstanding: ${formatMoney(selectedInvoice.amount, selectedInvoice.currency)}`
              : undefined
          }
        />
        <Input
          label="Reference number"
          value={values.referenceNumber}
          onChange={(event) => update('referenceNumber', event.target.value)}
          placeholder="Optional bank or card reference"
        />
        <div className="sm:col-span-2">
          <Textarea
            label="Notes"
            rows={3}
            value={values.notes}
            onChange={(event) => update('notes', event.target.value)}
            placeholder="Optional notes about this payment"
          />
        </div>
      </div>
    </Modal>
  )
}
