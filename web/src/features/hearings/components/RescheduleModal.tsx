import { useEffect, useState } from 'react'

import { Button } from '@/shared/components/Button'
import { Checkbox } from '@/shared/components/Checkbox'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { Textarea } from '@/shared/components/Textarea'
import { formatShortDate, formatTime } from '@/shared/lib/utils'

import {
  emptyRescheduleForm,
  validateRescheduleForm,
  type RescheduleFormErrors,
} from '../lib/outcomeForm'
import type { HearingListItem, HearingReschedulePayload } from '../types'

interface RescheduleModalProps {
  open: boolean
  hearing: HearingListItem | null
  saving: boolean
  onSave: (payload: HearingReschedulePayload) => void
  onClose: () => void
}

export function RescheduleModal({
  open,
  hearing,
  saving,
  onSave,
  onClose,
}: RescheduleModalProps) {
  const [values, setValues] = useState<HearingReschedulePayload>(emptyRescheduleForm)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(emptyRescheduleForm)
    setSubmitAttempted(false)
  }, [open])

  const errors = validateRescheduleForm(values)
  const isValid = Object.keys(errors).length === 0
  const visible: RescheduleFormErrors = submitAttempted ? errors : {}

  function submit() {
    setSubmitAttempted(true)
    if (!isValid) return
    onSave(values)
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => undefined : onClose}
      title="Reschedule Hearing"
      description="Choose a new date and time for this appearance."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!isValid}>
            Confirm Reschedule
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {hearing ? (
          <p className="rounded-xl border border-border-subtle bg-surface-muted px-3.5 py-3 text-sm text-text-secondary">
            Currently scheduled for{' '}
            <strong className="font-semibold text-navy">
              {formatShortDate(hearing.scheduledAt)} at {formatTime(hearing.scheduledAt)}
            </strong>
            {hearing.caseRef ? ` · ${hearing.caseRef.caseNumber}` : null}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="New Date"
            type="date"
            required
            value={values.date}
            error={visible.date}
            onChange={(event) =>
              setValues((current) => ({ ...current, date: event.target.value }))
            }
          />
          <Input
            label="New Time"
            type="time"
            required
            value={values.time}
            error={visible.time}
            onChange={(event) =>
              setValues((current) => ({ ...current, time: event.target.value }))
            }
          />
        </div>

        <Textarea
          label="Reason"
          required
          rows={3}
          placeholder="Explain why this hearing is being moved…"
          value={values.reason}
          error={visible.reason}
          onChange={(event) =>
            setValues((current) => ({ ...current, reason: event.target.value }))
          }
        />

        <Checkbox
          label="Notify client of the new date"
          checked={values.notifyClient}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              notifyClient: event.target.checked,
            }))
          }
        />
      </div>
    </Modal>
  )
}
