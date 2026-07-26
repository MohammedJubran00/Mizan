import { useCallback, useMemo, useRef, useState } from 'react'

import {
  emptyCaseFormValues,
  validateCaseForm,
  type CaseFormErrors,
  type CaseFormField,
  type CaseFormValues,
} from '../lib/caseForm'
import type { CasePersonRef } from '../types'

type TouchedMap = Partial<Record<CaseFormField, boolean>>

export function useCaseForm(initialValues: CaseFormValues = emptyCaseFormValues) {
  const initialRef = useRef(initialValues)
  const [values, setValues] = useState<CaseFormValues>(initialValues)
  const [touched, setTouched] = useState<TouchedMap>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const errors = useMemo(() => validateCaseForm(values), [values])
  const isValid = Object.keys(errors).length === 0

  const visibleErrors = useMemo<CaseFormErrors>(() => {
    if (submitAttempted) return errors

    return Object.fromEntries(
      Object.entries(errors).filter(([field]) => touched[field as CaseFormField]),
    ) as CaseFormErrors
  }, [errors, submitAttempted, touched])

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialRef.current),
    [values],
  )

  const setField = useCallback((field: CaseFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
  }, [])

  const blurField = useCallback((field: CaseFormField) => {
    setTouched((current) => ({ ...current, [field]: true }))
  }, [])

  const setClient = useCallback((client: CasePersonRef | null) => {
    setValues((current) => ({
      ...current,
      clientId: client?.id ?? '',
      clientName: client?.fullName ?? '',
    }))
    setTouched((current) => ({ ...current, clientId: true }))
  }, [])

  const setLeadLawyer = useCallback((lawyer: CasePersonRef | null) => {
    setValues((current) => ({
      ...current,
      leadLawyerId: lawyer?.id ?? '',
      leadLawyerName: lawyer?.fullName ?? '',
    }))
  }, [])

  const addTeamMember = useCallback((member: CasePersonRef) => {
    setValues((current) =>
      current.teamMemberIds.includes(member.id)
        ? current
        : {
            ...current,
            teamMemberIds: [...current.teamMemberIds, member.id],
            teamMemberNames: [...current.teamMemberNames, member.fullName],
          },
    )
  }, [])

  const removeTeamMember = useCallback((id: string) => {
    setValues((current) => {
      const index = current.teamMemberIds.indexOf(id)
      if (index === -1) return current

      return {
        ...current,
        teamMemberIds: current.teamMemberIds.filter((item) => item !== id),
        teamMemberNames: current.teamMemberNames.filter((_, i) => i !== index),
      }
    })
  }, [])

  const reset = useCallback((next: CaseFormValues = initialRef.current) => {
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
    setLeadLawyer,
    addTeamMember,
    removeTeamMember,
    reset,
    markSubmitted,
  }
}

export type CaseFormApi = ReturnType<typeof useCaseForm>
