import { paymentMethodLabels } from './labels'
import type { PaymentMethod, PaymentPayload } from '../types'
import { PAYMENT_METHODS } from '../types'

export interface PaymentFormValues {
  invoiceId: string
  invoiceLabel: string
  paymentDate: string
  method: PaymentMethod | ''
  amount: string
  referenceNumber: string
  notes: string
}

export type PaymentFormField = keyof PaymentFormValues
export type PaymentFormErrors = Partial<Record<PaymentFormField, string>>

export const emptyPaymentFormValues: PaymentFormValues = {
  invoiceId: '',
  invoiceLabel: '',
  paymentDate: '',
  method: '',
  amount: '',
  referenceNumber: '',
  notes: '',
}

export const paymentMethodOptions = PAYMENT_METHODS.map((value) => ({
  value,
  label: paymentMethodLabels[value],
}))

export function validatePaymentForm(
  values: PaymentFormValues,
  balanceDue?: number | null,
): PaymentFormErrors {
  const errors: PaymentFormErrors = {}

  if (!values.invoiceId) errors.invoiceId = 'Select an invoice.'
  if (!values.paymentDate) errors.paymentDate = 'Payment date is required.'
  else if (Number.isNaN(new Date(values.paymentDate).getTime())) {
    errors.paymentDate = 'Enter a valid date.'
  }

  if (!values.method) errors.method = 'Select a payment method.'

  const amount = Number(values.amount)
  if (values.amount.trim() === '' || !Number.isFinite(amount)) {
    errors.amount = 'Enter a valid amount.'
  } else if (amount <= 0) {
    errors.amount = 'Amount must be greater than zero.'
  } else if (balanceDue != null && amount > balanceDue + 0.001) {
    errors.amount = 'Amount cannot exceed the outstanding balance.'
  }

  return errors
}

export function toPaymentPayload(values: PaymentFormValues): PaymentPayload {
  return {
    invoiceId: values.invoiceId,
    paymentDate: values.paymentDate,
    method: values.method as PaymentMethod,
    amount: Number(values.amount),
    referenceNumber: values.referenceNumber.trim() || undefined,
    notes: values.notes.trim() || undefined,
  }
}
