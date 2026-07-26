import { useCallback, useMemo, useState } from 'react'

import {
  emptyUserFormValues,
  validateUserForm,
  type UserFormErrors,
  type UserFormField,
  type UserFormValues,
} from '../lib/userForm'

export function useUserForm(
  initialValues: UserFormValues = emptyUserFormValues,
  options: { requirePassword: boolean } = { requirePassword: true },
) {
  const [values, setValues] = useState<UserFormValues>(initialValues)
  const [errors, setErrors] = useState<UserFormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<UserFormField, boolean>>>(
    {},
  )
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const updateField = useCallback(
    <K extends UserFormField>(field: K, value: UserFormValues[K]) => {
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

  const touchField = useCallback((field: UserFormField) => {
    setTouched((current) => ({ ...current, [field]: true }))
  }, [])

  const fieldError = useCallback(
    (field: UserFormField) => {
      if (!submitAttempted && !touched[field]) return undefined
      return errors[field]
    },
    [errors, submitAttempted, touched],
  )

  const validate = useCallback(() => {
    const nextErrors = validateUserForm(values, options)
    setErrors(nextErrors)
    setSubmitAttempted(true)
    return Object.keys(nextErrors).length === 0
  }, [values, options])

  const reset = useCallback((next: UserFormValues = emptyUserFormValues) => {
    setValues(next)
    setErrors({})
    setTouched({})
    setSubmitAttempted(false)
  }, [])

  return useMemo(
    () => ({
      values,
      errors,
      updateField,
      touchField,
      fieldError,
      validate,
      reset,
      submitAttempted,
    }),
    [
      values,
      errors,
      updateField,
      touchField,
      fieldError,
      validate,
      reset,
      submitAttempted,
    ],
  )
}

export type UserFormApi = ReturnType<typeof useUserForm>
