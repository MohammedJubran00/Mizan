import { useEffect, useState } from 'react'

import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { Select } from '@/shared/components/Select'
import { Textarea } from '@/shared/components/Textarea'

import { hearingTypeOptions } from '../lib/labels'
import {
  emptyHearingFormValues,
  validateHearingForm,
  type HearingFormErrors,
} from '../lib/hearingForm'
import type { HearingPayload } from '../types'

interface ScheduleHearingDialogProps {
  open: boolean
  saving: boolean
  /** Prefills court and judge from the case record. */
  defaults?: Partial<HearingPayload>
  onSubmit: (payload: HearingPayload) => void
  onClose: () => void
}

export function ScheduleHearingDialog({
  open,
  saving,
  defaults,
  onSubmit,
  onClose,
}: ScheduleHearingDialogProps) {
  const [values, setValues] = useState<HearingPayload>({
    ...emptyHearingFormValues,
    ...defaults,
  })
  const [submitAttempted, setSubmitAttempted] = useState(false)

  useEffect(() => {
    if (!open) return

    setValues({ ...emptyHearingFormValues, ...defaults })
    setSubmitAttempted(false)
  }, [open, defaults])

  const errors = validateHearingForm(values)
  const isValid = Object.keys(errors).length === 0
  const visibleErrors: HearingFormErrors = submitAttempted ? errors : {}

  function setField(field: keyof HearingPayload, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function submit() {
    setSubmitAttempted(true)
    if (!isValid) return
    onSubmit(values)
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => undefined : onClose}
      title="Schedule Hearing"
      description="Add a court date to this matter."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!isValid}>
            Schedule Hearing
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            name="type"
            label="Hearing Type"
            required
            placeholder="Select a type"
            options={hearingTypeOptions}
            value={values.type}
            error={visibleErrors.type}
            onChange={(event) => setField('type', event.target.value)}
          />
          <Input
            name="scheduledAt"
            label="Date & Time"
            type="datetime-local"
            required
            value={values.scheduledAt}
            error={visibleErrors.scheduledAt}
            onChange={(event) => setField('scheduledAt', event.target.value)}
          />
          <Input
            name="court"
            label="Court / Tribunal"
            required
            placeholder="e.g. Civil District Court"
            value={values.court}
            error={visibleErrors.court}
            onChange={(event) => setField('court', event.target.value)}
          />
          <Input
            name="room"
            label="Room"
            placeholder="e.g. Room 402B"
            value={values.room}
            onChange={(event) => setField('room', event.target.value)}
          />
          <Input
            name="judgeName"
            label="Judge"
            className="sm:col-span-2"
            placeholder="e.g. Hon. Jane Doe"
            value={values.judgeName}
            onChange={(event) => setField('judgeName', event.target.value)}
          />
        </div>

        <Textarea
          name="notes"
          label="Notes"
          rows={3}
          placeholder="Filing requirements, colloquy expectations, attendees…"
          value={values.notes}
          onChange={(event) => setField('notes', event.target.value)}
        />
      </div>
    </Modal>
  )
}
