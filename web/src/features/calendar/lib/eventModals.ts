import type { EventCompletionPayload, EventReschedulePayload } from '../types'
import { combineDateTime } from './calendarDates'

export type RescheduleFormErrors = Partial<
  Record<'date' | 'startTime' | 'endTime' | 'reason', string>
>

export const emptyRescheduleForm: EventReschedulePayload = {
  date: '',
  startTime: '',
  endTime: '',
  reason: '',
  notifyParticipants: true,
}

export function validateRescheduleForm(values: EventReschedulePayload) {
  const errors: RescheduleFormErrors = {}

  if (!values.date) errors.date = 'Pick the new date.'
  if (!values.startTime) errors.startTime = 'Pick the new start time.'
  if (!values.endTime) errors.endTime = 'Pick the new end time.'

  const start = combineDateTime(values.date, values.startTime)
  const end = combineDateTime(values.date, values.endTime)

  if (start && end && end <= start) {
    errors.endTime = 'End time must be after the start time.'
  }

  if (!values.reason.trim()) {
    errors.reason = 'Add a short reason for the change.'
  }

  return errors
}

export type CompletionFormErrors = Partial<Record<'notes', string>>

export const emptyCompletionForm: EventCompletionPayload = {
  completed: true,
  notes: '',
}

export function validateCompletionForm(values: EventCompletionPayload) {
  const errors: CompletionFormErrors = {}

  // Notes are optional when completing, but required when reverting so the
  // audit trail explains why the event went back on the schedule.
  if (!values.completed && !values.notes.trim()) {
    errors.notes = 'Explain why the completion is being reverted.'
  }

  return errors
}
