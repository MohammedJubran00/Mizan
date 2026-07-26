import { useCallback, useMemo, useState } from 'react'

import {
  emptyReportBuilderValues,
  validateReportBuilder,
  type ReportBuilderErrors,
  type ReportBuilderField,
  type ReportBuilderValues,
} from '../lib/reportForm'
import type { DataSource, ExportFormat } from '../types'

export function useReportBuilder(
  initialValues: ReportBuilderValues = emptyReportBuilderValues,
) {
  const [values, setValues] = useState<ReportBuilderValues>(initialValues)
  const [errors, setErrors] = useState<ReportBuilderErrors>({})
  const [touched, setTouched] = useState<
    Partial<Record<ReportBuilderField, boolean>>
  >({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const updateField = useCallback(
    <K extends keyof ReportBuilderValues>(
      field: K,
      value: ReportBuilderValues[K],
    ) => {
      setValues((current) => ({ ...current, [field]: value }))
      setErrors((current) => {
        if (!(field in current)) return current
        const next = { ...current }
        delete next[field as ReportBuilderField]
        return next
      })
    },
    [],
  )

  const touchField = useCallback((field: ReportBuilderField) => {
    setTouched((current) => ({ ...current, [field]: true }))
  }, [])

  const toggleSource = useCallback((source: DataSource) => {
    setValues((current) => {
      const next = current.dataSources.includes(source)
        ? current.dataSources.filter((item) => item !== source)
        : [...current.dataSources, source]
      return { ...current, dataSources: next }
    })
    setErrors((current) => {
      if (!current.dataSources) return current
      const next = { ...current }
      delete next.dataSources
      return next
    })
  }, [])

  const toggleFormat = useCallback((format: ExportFormat) => {
    setValues((current) => {
      const next = current.formats.includes(format)
        ? current.formats.filter((item) => item !== format)
        : [...current.formats, format]
      return { ...current, formats: next }
    })
  }, [])

  const fieldError = useCallback(
    (field: ReportBuilderField | 'dataSources' | 'formats') => {
      if (field === 'dataSources' || field === 'formats') {
        return submitAttempted ? errors[field] : undefined
      }
      if (!submitAttempted && !touched[field]) return undefined
      return errors[field]
    },
    [errors, submitAttempted, touched],
  )

  const validate = useCallback(() => {
    const nextErrors = validateReportBuilder(values)
    setErrors(nextErrors)
    setSubmitAttempted(true)
    return Object.keys(nextErrors).length === 0
  }, [values])

  const reset = useCallback(
    (next: ReportBuilderValues = emptyReportBuilderValues) => {
      setValues(next)
      setErrors({})
      setTouched({})
      setSubmitAttempted(false)
    },
    [],
  )

  return useMemo(
    () => ({
      values,
      errors,
      updateField,
      touchField,
      toggleSource,
      toggleFormat,
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
      toggleSource,
      toggleFormat,
      fieldError,
      validate,
      reset,
      submitAttempted,
    ],
  )
}
