import { computeInvoiceTotals, computeLineTotals } from './calculations'
import type {
  CurrencyCode,
  InvoiceDetails,
  InvoicePayload,
  InvoiceTerms,
} from '../types'

export interface InvoiceItemFormValues {
  key: string
  description: string
  quantity: string
  rate: string
  taxRate: string
  discountRate: string
}

export interface InvoiceFormValues {
  clientId: string
  clientName: string
  caseId: string
  caseLabel: string
  billingLawyerId: string
  billingLawyerName: string
  currency: CurrencyCode | ''
  terms: InvoiceTerms | ''
  issueDate: string
  dueDate: string
  paymentInstructions: string
  caseSummary: string
  items: InvoiceItemFormValues[]
}

export type InvoiceGeneralField = keyof Omit<InvoiceFormValues, 'items'>
export type InvoiceItemField = keyof Omit<InvoiceItemFormValues, 'key'>

export type InvoiceFormErrors = Partial<
  Record<InvoiceGeneralField, string> & {
    items?: string
    itemErrors?: Record<string, Partial<Record<InvoiceItemField, string>>>
  }
>

let itemKeyCounter = 0

export function createEmptyItem(): InvoiceItemFormValues {
  itemKeyCounter += 1
  return {
    key: `item-${itemKeyCounter}`,
    description: '',
    quantity: '1',
    rate: '',
    taxRate: '0',
    discountRate: '0',
  }
}

export const emptyInvoiceFormValues: InvoiceFormValues = {
  clientId: '',
  clientName: '',
  caseId: '',
  caseLabel: '',
  billingLawyerId: '',
  billingLawyerName: '',
  currency: 'USD',
  terms: 'NET_30',
  issueDate: '',
  dueDate: '',
  paymentInstructions: '',
  caseSummary: '',
  items: [createEmptyItem()],
}

function parseDate(value: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function parseNumber(value: string) {
  if (value.trim() === '') return NaN
  return Number(value)
}

export function validateInvoiceGeneral(
  values: InvoiceFormValues,
): InvoiceFormErrors {
  const errors: InvoiceFormErrors = {}

  if (!values.clientId) errors.clientId = 'Select a client.'
  if (!values.billingLawyerId) {
    errors.billingLawyerId = 'Select the billing lawyer.'
  }
  if (!values.currency) errors.currency = 'Select a currency.'
  if (!values.terms) errors.terms = 'Select payment terms.'

  const issueDate = parseDate(values.issueDate)
  const dueDate = parseDate(values.dueDate)

  if (!values.issueDate) errors.issueDate = 'Issue date is required.'
  else if (!issueDate) errors.issueDate = 'Enter a valid issue date.'

  if (!values.dueDate) errors.dueDate = 'Due date is required.'
  else if (!dueDate) errors.dueDate = 'Enter a valid due date.'
  else if (issueDate && dueDate < issueDate) {
    errors.dueDate = 'Due date must be on or after the issue date.'
  }

  return errors
}

export function validateInvoiceItems(
  values: InvoiceFormValues,
): InvoiceFormErrors {
  const errors: InvoiceFormErrors = {}
  const itemErrors: Record<string, Partial<Record<InvoiceItemField, string>>> =
    {}

  if (values.items.length === 0) {
    errors.items = 'Add at least one invoice item.'
    return errors
  }

  for (const item of values.items) {
    const fieldErrors: Partial<Record<InvoiceItemField, string>> = {}
    const quantity = parseNumber(item.quantity)
    const rate = parseNumber(item.rate)
    const taxRate = parseNumber(item.taxRate)
    const discountRate = parseNumber(item.discountRate)

    if (!item.description.trim()) {
      fieldErrors.description = 'Description is required.'
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      fieldErrors.quantity = 'Enter a quantity greater than zero.'
    }

    if (!Number.isFinite(rate) || rate < 0) {
      fieldErrors.rate = 'Enter a valid rate.'
    }

    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      fieldErrors.taxRate = 'Tax must be between 0 and 100.'
    }

    if (
      !Number.isFinite(discountRate) ||
      discountRate < 0 ||
      discountRate > 100
    ) {
      fieldErrors.discountRate = 'Discount must be between 0 and 100.'
    }

    if (Object.keys(fieldErrors).length > 0) {
      itemErrors[item.key] = fieldErrors
    }
  }

  if (Object.keys(itemErrors).length > 0) {
    errors.itemErrors = itemErrors
    errors.items = 'Fix the highlighted line items.'
  }

  return errors
}

export function validateInvoiceForm(values: InvoiceFormValues): InvoiceFormErrors {
  return {
    ...validateInvoiceGeneral(values),
    ...validateInvoiceItems(values),
  }
}

export function summarizeInvoiceForm(values: InvoiceFormValues) {
  const parsed = values.items.map((item) => ({
    quantity: Number(item.quantity) || 0,
    rate: Number(item.rate) || 0,
    taxRate: Number(item.taxRate) || 0,
    discountRate: Number(item.discountRate) || 0,
  }))

  return computeInvoiceTotals(parsed)
}

export function toInvoicePayload(
  values: InvoiceFormValues,
  status: 'DRAFT' | 'SENT' = 'SENT',
): InvoicePayload {
  return {
    clientId: values.clientId,
    caseId: values.caseId || null,
    billingLawyerId: values.billingLawyerId,
    currency: values.currency as CurrencyCode,
    terms: values.terms as InvoiceTerms,
    issueDate: values.issueDate,
    dueDate: values.dueDate,
    paymentInstructions: values.paymentInstructions.trim() || undefined,
    caseSummary: values.caseSummary.trim() || undefined,
    status,
    items: values.items.map((item) => ({
      description: item.description.trim(),
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      taxRate: Number(item.taxRate) || 0,
      discountRate: Number(item.discountRate) || 0,
    })),
  }
}

export function toInvoiceFormValues(invoice: InvoiceDetails): InvoiceFormValues {
  return {
    clientId: invoice.client?.id ?? '',
    clientName: invoice.client?.fullName ?? '',
    caseId: invoice.relatedCase?.id ?? '',
    caseLabel: invoice.relatedCase
      ? `${invoice.relatedCase.caseNumber} — ${invoice.relatedCase.title}`
      : '',
    billingLawyerId: invoice.billingLawyer?.id ?? '',
    billingLawyerName: invoice.billingLawyer?.fullName ?? '',
    currency: invoice.currency,
    terms: invoice.terms,
    issueDate: invoice.issueDate.slice(0, 10),
    dueDate: invoice.dueDate?.slice(0, 10) ?? '',
    paymentInstructions: invoice.paymentInstructions ?? '',
    caseSummary: invoice.caseSummary ?? '',
    items:
      invoice.items.length > 0
        ? invoice.items.map((item) => {
            itemKeyCounter += 1
            return {
              key: `item-${itemKeyCounter}`,
              description: item.description,
              quantity: String(item.quantity),
              rate: String(item.rate),
              taxRate: String(item.taxRate),
              discountRate: String(item.discountRate),
            }
          })
        : [createEmptyItem()],
  }
}

export function previewLineAmount(item: InvoiceItemFormValues) {
  return computeLineTotals({
    quantity: Number(item.quantity) || 0,
    rate: Number(item.rate) || 0,
    taxRate: Number(item.taxRate) || 0,
    discountRate: Number(item.discountRate) || 0,
  }).lineTotal
}
