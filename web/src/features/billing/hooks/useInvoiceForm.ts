import { useCallback, useMemo, useState } from 'react'

import {
  createEmptyItem,
  emptyInvoiceFormValues,
  validateInvoiceForm,
  validateInvoiceGeneral,
  validateInvoiceItems,
  type InvoiceFormErrors,
  type InvoiceFormValues,
  type InvoiceGeneralField,
  type InvoiceItemField,
  type InvoiceItemFormValues,
} from '../lib/invoiceForm'

export function useInvoiceForm(initialValues: InvoiceFormValues = emptyInvoiceFormValues) {
  const [values, setValues] = useState<InvoiceFormValues>(initialValues)
  const [errors, setErrors] = useState<InvoiceFormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<InvoiceGeneralField, boolean>>>(
    {},
  )
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const updateField = useCallback(
    <K extends InvoiceGeneralField>(field: K, value: InvoiceFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }))
      setErrors((current) => {
        if (!current[field]) return current
        const next = { ...current }
        delete next[field]
        return next
      })
    },
    [],
  )

  const touchField = useCallback((field: InvoiceGeneralField) => {
    setTouched((current) => ({ ...current, [field]: true }))
  }, [])

  const updateItem = useCallback(
    (key: string, field: InvoiceItemField, value: string) => {
      setValues((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.key === key ? { ...item, [field]: value } : item,
        ),
      }))
      setErrors((current) => {
        if (!current.itemErrors?.[key]?.[field]) return current
        const itemErrors = { ...current.itemErrors }
        const fieldErrors = { ...itemErrors[key] }
        delete fieldErrors[field]
        if (Object.keys(fieldErrors).length === 0) delete itemErrors[key]
        else itemErrors[key] = fieldErrors
        return {
          ...current,
          itemErrors:
            Object.keys(itemErrors).length > 0 ? itemErrors : undefined,
          items:
            Object.keys(itemErrors).length > 0 ? current.items : undefined,
        }
      })
    },
    [],
  )

  const addItem = useCallback(() => {
    setValues((current) => ({
      ...current,
      items: [...current.items, createEmptyItem()],
    }))
  }, [])

  const removeItem = useCallback((key: string) => {
    setValues((current) => ({
      ...current,
      items:
        current.items.length <= 1
          ? current.items
          : current.items.filter((item) => item.key !== key),
    }))
  }, [])

  const replaceItems = useCallback((items: InvoiceItemFormValues[]) => {
    setValues((current) => ({ ...current, items }))
  }, [])

  const fieldError = useCallback(
    (field: InvoiceGeneralField) => {
      if (!submitAttempted && !touched[field]) return undefined
      return errors[field]
    },
    [errors, submitAttempted, touched],
  )

  const itemFieldError = useCallback(
    (key: string, field: InvoiceItemField) => {
      if (!submitAttempted) return undefined
      return errors.itemErrors?.[key]?.[field]
    },
    [errors, submitAttempted],
  )

  const goToItems = useCallback(() => {
    const nextErrors = validateInvoiceGeneral(values)
    setErrors(nextErrors)
    setSubmitAttempted(true)

    if (Object.keys(nextErrors).length > 0) return false

    setSubmitAttempted(false)
    setStep(2)
    return true
  }, [values])

  const goToGeneral = useCallback(() => {
    setStep(1)
    setSubmitAttempted(false)
  }, [])

  const validateAll = useCallback(() => {
    const nextErrors = validateInvoiceForm(values)
    setErrors(nextErrors)
    setSubmitAttempted(true)
    return Object.keys(nextErrors).length === 0
  }, [values])

  const validateItemsOnly = useCallback(() => {
    const nextErrors = validateInvoiceItems(values)
    setErrors((current) => ({ ...current, ...nextErrors }))
    setSubmitAttempted(true)
    return Object.keys(nextErrors).length === 0
  }, [values])

  const reset = useCallback((next: InvoiceFormValues = emptyInvoiceFormValues) => {
    setValues(next)
    setErrors({})
    setTouched({})
    setSubmitAttempted(false)
    setStep(1)
  }, [])

  return useMemo(
    () => ({
      values,
      errors,
      step,
      setStep,
      updateField,
      touchField,
      updateItem,
      addItem,
      removeItem,
      replaceItems,
      fieldError,
      itemFieldError,
      goToItems,
      goToGeneral,
      validateAll,
      validateItemsOnly,
      reset,
      submitAttempted,
    }),
    [
      values,
      errors,
      step,
      updateField,
      touchField,
      updateItem,
      addItem,
      removeItem,
      replaceItems,
      fieldError,
      itemFieldError,
      goToItems,
      goToGeneral,
      validateAll,
      validateItemsOnly,
      reset,
      submitAttempted,
    ],
  )
}
