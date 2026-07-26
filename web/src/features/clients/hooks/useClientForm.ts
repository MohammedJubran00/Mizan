import { useCallback, useMemo, useRef, useState } from 'react'

import {
  emptyClientFormValues,
  validateClientForm,
  type ClientFormErrors,
  type ClientFormField,
  type ClientFormValues,
} from '../lib/clientForm'

type TouchedMap = Partial<Record<ClientFormField, boolean>>

export function useClientForm(initialValues: ClientFormValues = emptyClientFormValues) {
  const initialRef = useRef(initialValues)
  const [values, setValues] = useState<ClientFormValues>(initialValues)
  const [touched, setTouched] = useState<TouchedMap>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const errors = useMemo(() => validateClientForm(values), [values])
  const isValid = Object.keys(errors).length === 0

  const visibleErrors = useMemo<ClientFormErrors>(() => {
    if (submitAttempted) return errors

    return Object.fromEntries(
      Object.entries(errors).filter(([field]) => touched[field as ClientFormField]),
    ) as ClientFormErrors
  }, [errors, submitAttempted, touched])

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialRef.current),
    [values],
  )

  const setField = useCallback((field: ClientFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
  }, [])

  const blurField = useCallback((field: ClientFormField) => {
    setTouched((current) => ({ ...current, [field]: true }))
  }, [])

  const addTag = useCallback((label: string) => {
    const trimmed = label.trim().slice(0, 32)
    if (!trimmed) return

    setValues((current) =>
      current.tags.some(
        (tag) => tag.toLowerCase() === trimmed.toLowerCase(),
      )
        ? current
        : { ...current, tags: [...current.tags, trimmed] },
    )
  }, [])

  const removeTag = useCallback((label: string) => {
    setValues((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag !== label),
    }))
  }, [])

  const setNotes = useCallback((notes: string) => {
    setValues((current) => ({ ...current, notes }))
  }, [])

  const reset = useCallback((next: ClientFormValues = initialRef.current) => {
    initialRef.current = next
    setValues(next)
    setTouched({})
    setSubmitAttempted(false)
  }, [])

  const markSubmitted = useCallback(() => setSubmitAttempted(true), [])

  return {
    values,
    errors: visibleErrors,
    isValid,
    isDirty,
    setField,
    blurField,
    addTag,
    removeTag,
    setNotes,
    reset,
    markSubmitted,
  }
}

export type ClientFormApi = ReturnType<typeof useClientForm>
