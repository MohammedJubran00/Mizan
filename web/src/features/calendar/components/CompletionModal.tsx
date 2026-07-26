import { useEffect, useState } from 'react'

import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'
import { Textarea } from '@/shared/components/Textarea'
import { formatDateTime, formatShortDate } from '@/shared/lib/utils'

import {
  emptyCompletionForm,
  validateCompletionForm,
  type CompletionFormErrors,
} from '../lib/eventModals'
import type { CalendarEventItem, EventCompletion, EventCompletionPayload } from '../types'

interface CompletionModalProps {
  open: boolean
  event: CalendarEventItem | null
  /** Existing completion record, when the event is already marked complete. */
  completion?: EventCompletion | null
  saving: boolean
  onSave: (payload: EventCompletionPayload) => void
  onClose: () => void
}

export function CompletionModal({
  open,
  event,
  completion = null,
  saving,
  onSave,
  onClose,
}: CompletionModalProps) {
  const alreadyComplete = event?.status === 'COMPLETED'
  const [values, setValues] = useState<EventCompletionPayload>(emptyCompletionForm)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues({ completed: !alreadyComplete, notes: '' })
    setSubmitAttempted(false)
  }, [open, alreadyComplete])

  const errors = validateCompletionForm(values)
  const isValid = Object.keys(errors).length === 0
  const visible: CompletionFormErrors = submitAttempted ? errors : {}

  function submit() {
    setSubmitAttempted(true)
    if (!isValid) return
    onSave(values)
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => undefined : onClose}
      title={alreadyComplete ? 'Reopen event' : 'Mark event complete'}
      description={
        alreadyComplete
          ? 'Move this event back onto the active schedule.'
          : 'Record the outcome so the team knows this event is closed.'
      }
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!isValid}>
            {alreadyComplete ? 'Reopen event' : 'Mark complete'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {event ? (
          <p className="rounded-xl border border-border-subtle bg-surface-muted px-3.5 py-3 text-sm text-text-secondary">
            <strong className="font-semibold text-navy">{event.title}</strong> ·{' '}
            {formatShortDate(event.startAt)}
          </p>
        ) : null}

        {completion ? (
          <p className="text-xs text-text-muted">
            Completed {formatDateTime(completion.completedAt)}
            {completion.completedByName ? ` by ${completion.completedByName}` : ''}
          </p>
        ) : null}

        <Textarea
          label="Completion notes"
          required={!values.completed}
          rows={4}
          placeholder={
            values.completed
              ? 'Summarise what was decided or delivered…'
              : 'Explain why this event is being reopened…'
          }
          value={values.notes}
          error={visible.notes}
          onChange={(changeEvent) =>
            setValues((current) => ({ ...current, notes: changeEvent.target.value }))
          }
        />

        <p className="text-xs text-text-muted">
          {values.completed
            ? 'The completion timestamp is recorded automatically when you confirm.'
            : 'Reopening clears the recorded completion timestamp.'}
        </p>
      </div>
    </Modal>
  )
}
