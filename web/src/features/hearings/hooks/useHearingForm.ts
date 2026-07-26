import { useCallback, useMemo, useRef, useState } from 'react'

import {
  emptyHearingFormValues,
  validateHearingForm,
  type HearingFormErrors,
  type HearingFormField,
  type HearingFormValues,
} from '../lib/hearingForm'
import type { HearingCaseRef, HearingPersonRef } from '../types'

type TouchedMap = Partial<Record<HearingFormField, boolean>>

export function useHearingForm(
  initialValues: HearingFormValues = emptyHearingFormValues,
) {
  const initialRef = useRef(initialValues)
  const [values, setValues] = useState<HearingFormValues>(initialValues)
  const [touched, setTouched] = useState<TouchedMap>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const errors = useMemo(() => validateHearingForm(values), [values])
  const isValid = Object.keys(errors).length === 0

  const visibleErrors = useMemo<HearingFormErrors>(() => {
    if (submitAttempted) return errors
    return Object.fromEntries(
      Object.entries(errors).filter(
        ([field]) => touched[field as HearingFormField],
      ),
    ) as HearingFormErrors
  }, [errors, submitAttempted, touched])

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialRef.current),
    [values],
  )

  const setField = useCallback(
    <K extends HearingFormField>(field: K, value: HearingFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }))
    },
    [],
  )

  const blurField = useCallback((field: HearingFormField) => {
    setTouched((current) => ({ ...current, [field]: true }))
  }, [])

  const setCase = useCallback((caseRef: HearingCaseRef | null, clientName = '') => {
    setValues((current) => ({
      ...current,
      caseId: caseRef?.id ?? '',
      caseLabel: caseRef
        ? `${caseRef.caseNumber} — ${caseRef.title}`
        : '',
      clientName: caseRef ? clientName : '',
    }))
    setTouched((current) => ({ ...current, caseId: true }))
  }, [])

  const setLeadLawyer = useCallback((lawyer: HearingPersonRef | null) => {
    setValues((current) => ({
      ...current,
      leadLawyerId: lawyer?.id ?? '',
      leadLawyerName: lawyer?.fullName ?? '',
    }))
  }, [])

  const reset = useCallback((next: HearingFormValues = initialRef.current) => {
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
    setCase,
    setLeadLawyer,
    reset,
    markSubmitted,
  }
}

export type HearingFormApi = ReturnType<typeof useHearingForm>
