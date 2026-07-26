import { useCallback, useMemo, useRef, useState } from 'react'

import {
  emptyEventFormValues,
  validateEventForm,
  type EventFormErrors,
  type EventFormField,
  type EventFormValues,
} from '../lib/eventForm'
import type { EventCaseRef, EventPersonRef } from '../types'

type TouchedMap = Partial<Record<EventFormField, boolean>>

export function useEventForm(
  initialValues: EventFormValues = emptyEventFormValues,
) {
  const initialRef = useRef(initialValues)
  const [values, setValues] = useState<EventFormValues>(initialValues)
  const [touched, setTouched] = useState<TouchedMap>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const errors = useMemo(() => validateEventForm(values), [values])
  const isValid = Object.keys(errors).length === 0

  const visibleErrors = useMemo<EventFormErrors>(() => {
    if (submitAttempted) return errors
    return Object.fromEntries(
      Object.entries(errors).filter(([field]) => touched[field as EventFormField]),
    ) as EventFormErrors
  }, [errors, submitAttempted, touched])

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialRef.current),
    [values],
  )

  const setField = useCallback(
    <K extends EventFormField>(field: K, value: EventFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }))
    },
    [],
  )

  const blurField = useCallback((field: EventFormField) => {
    setTouched((current) => ({ ...current, [field]: true }))
  }, [])

  const setClient = useCallback((client: EventPersonRef | null) => {
    setValues((current) => ({
      ...current,
      clientId: client?.id ?? '',
      clientName: client?.fullName ?? '',
    }))
  }, [])

  const setCase = useCallback((caseRef: EventCaseRef | null) => {
    setValues((current) => ({
      ...current,
      caseId: caseRef?.id ?? '',
      caseLabel: caseRef ? `${caseRef.caseNumber} — ${caseRef.title}` : '',
    }))
  }, [])

  const setLeadLawyer = useCallback((lawyer: EventPersonRef | null) => {
    setValues((current) => ({
      ...current,
      leadLawyerId: lawyer?.id ?? '',
      leadLawyerName: lawyer?.fullName ?? '',
    }))
  }, [])

  const addParticipant = useCallback((person: EventPersonRef) => {
    setValues((current) =>
      current.participants.some((item) => item.id === person.id)
        ? current
        : { ...current, participants: [...current.participants, person] },
    )
  }, [])

  const removeParticipant = useCallback((id: string) => {
    setValues((current) => ({
      ...current,
      participants: current.participants.filter((person) => person.id !== id),
    }))
  }, [])

  const reset = useCallback((next: EventFormValues = initialRef.current) => {
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
    setClient,
    setCase,
    setLeadLawyer,
    addParticipant,
    removeParticipant,
    reset,
    markSubmitted,
  }
}

export type EventFormApi = ReturnType<typeof useEventForm>
