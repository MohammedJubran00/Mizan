import { useEffect, useState } from 'react'

import { Button } from '@/shared/components/Button'
import { Checkbox } from '@/shared/components/Checkbox'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { Textarea } from '@/shared/components/Textarea'
import { formatShortDate, formatTime } from '@/shared/lib/utils'

import { toDateInputValue, toTimeInputValue } from '../lib/calendarDates'
import {
  emptyRescheduleForm,
  validateRescheduleForm,
  type RescheduleFormErrors,
} from '../lib/eventModals'
import type { CalendarEventItem, EventReschedulePayload } from '../types'

interface RescheduleEventModalProps {
  open: boolean
  event: CalendarEventItem | null
  saving: boolean
  onSave: (payload: EventReschedulePayload) => void
  onClose: () => void
}

export function RescheduleEventModal({
  open,
  event,
  saving,
  onSave,
  onClose,
}: RescheduleEventModalProps) {
  const [values, setValues] = useState<EventReschedulePayload>(emptyRescheduleForm)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  useEffect(() => {
    if (!open) return

    // Prefill with the current schedule so only the change has to be typed.
    if (event) {
      const start = new Date(event.startAt)
      const end = new Date(event.endAt)
      const validStart = !Number.isNaN(start.getTime())
      const validEnd = !Number.isNaN(end.getTime())

      setValues({
        date: validStart ? toDateInputValue(start) : '',
        startTime: validStart ? toTimeInputValue(start) : '',
        endTime: validEnd ? toTimeInputValue(end) : '',
        reason: '',
        notifyParticipants: true,
      })
    } else {
      setValues(emptyRescheduleForm)
    }

    setSubmitAttempted(false)
  }, [open, event])

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
      title="Reschedule event"
      description="Pick a new slot and let the participants know."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!isValid}>
            Confirm reschedule
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {event ? (
          <p className="rounded-xl border border-border-subtle bg-surface-muted px-3.5 py-3 text-sm text-text-secondary">
            Currently{' '}
            <strong className="font-semibold text-navy">
              {formatShortDate(event.startAt)}
              {event.allDay ? '' : ` at ${formatTime(event.startAt)}`}
            </strong>
          </p>
        ) : null}

        <Input
          label="New date"
          type="date"
          required
          value={values.date}
          error={visible.date}
          onChange={(changeEvent) =>
            setValues((current) => ({ ...current, date: changeEvent.target.value }))
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="New start time"
            type="time"
            required
            value={values.startTime}
            error={visible.startTime}
            onChange={(changeEvent) =>
              setValues((current) => ({
                ...current,
                startTime: changeEvent.target.value,
              }))
            }
          />
          <Input
            label="New end time"
            type="time"
            required
            value={values.endTime}
            error={visible.endTime}
            onChange={(changeEvent) =>
              setValues((current) => ({
                ...current,
                endTime: changeEvent.target.value,
              }))
            }
          />
        </div>

        <Textarea
          label="Reason"
          required
          rows={3}
          placeholder="Explain why the event is moving…"
          value={values.reason}
          error={visible.reason}
          onChange={(changeEvent) =>
            setValues((current) => ({ ...current, reason: changeEvent.target.value }))
          }
        />

        <Checkbox
          label="Notify participants about the new time"
          checked={values.notifyParticipants}
          onChange={(changeEvent) =>
            setValues((current) => ({
              ...current,
              notifyParticipants: changeEvent.target.checked,
            }))
          }
        />
      </div>
    </Modal>
  )
}
