import { useEffect, useState } from 'react'

import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { Select } from '@/shared/components/Select'

import {
  exportFormatOptions,
  scheduleFrequencyOptions,
} from '../lib/labels'
import type { ExportFormat, ScheduleFrequency, ScheduleReportPayload } from '../types'

interface ScheduleReportModalProps {
  open: boolean
  reportName?: string
  saving: boolean
  onClose: () => void
  onSave: (payload: ScheduleReportPayload) => void
}

interface FormState {
  frequency: ScheduleFrequency | ''
  recipients: string
  format: ExportFormat | ''
  deliveryTime: string
}

interface FormErrors {
  frequency?: string
  recipients?: string
  format?: string
  deliveryTime?: string
}

const emptyForm: FormState = {
  frequency: 'MONTHLY',
  recipients: '',
  format: 'PDF',
  deliveryTime: '09:00',
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!values.frequency) errors.frequency = 'Select a frequency.'
  if (!values.recipients.trim()) {
    errors.recipients = 'Add at least one recipient email.'
  } else {
    const emails = values.recipients
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    if (emails.length === 0) {
      errors.recipients = 'Add at least one recipient email.'
    } else if (
      emails.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      errors.recipients = 'Enter valid email addresses separated by commas.'
    }
  }
  if (!values.format) errors.format = 'Select an export format.'
  if (!values.deliveryTime) errors.deliveryTime = 'Delivery time is required.'
  return errors
}

export function ScheduleReportModal({
  open,
  reportName,
  saving,
  onClose,
  onSave,
}: ScheduleReportModalProps) {
  const [values, setValues] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(emptyForm)
    setErrors({})
    setAttempted(false)
  }, [open])

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
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
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setAttempted(true)
    if (Object.keys(nextErrors).length > 0) return

    onSave({
      frequency: values.frequency as ScheduleFrequency,
      recipients: values.recipients.trim(),
      format: values.format as ExportFormat,
      deliveryTime: values.deliveryTime,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule report"
      description={
        reportName
          ? `Automate delivery for “${reportName}”. Scheduling is backend-ready.`
          : 'Automate report delivery. Scheduling is backend-ready.'
      }
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving}>
            Save schedule
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Frequency"
          required
          options={scheduleFrequencyOptions}
          value={values.frequency}
          onChange={(event) =>
            update('frequency', event.target.value as ScheduleFrequency)
          }
          error={attempted ? errors.frequency : undefined}
        />
        <Input
          label="Recipients"
          required
          value={values.recipients}
          onChange={(event) => update('recipients', event.target.value)}
          placeholder="partner@firm.com, finance@firm.com"
          error={attempted ? errors.recipients : undefined}
          hint="Separate multiple emails with commas."
        />
        <Select
          label="Export format"
          required
          options={exportFormatOptions}
          value={values.format}
          onChange={(event) =>
            update('format', event.target.value as ExportFormat)
          }
          error={attempted ? errors.format : undefined}
        />
        <Input
          label="Delivery time"
          type="time"
          required
          value={values.deliveryTime}
          onChange={(event) => update('deliveryTime', event.target.value)}
          error={attempted ? errors.deliveryTime : undefined}
        />
      </div>
    </Modal>
  )
}
