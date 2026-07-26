import type { HearingPayload } from '../types'

export type HearingFormField = keyof Omit<HearingPayload, never>

export type HearingFormErrors = Partial<Record<keyof HearingPayload, string>>

export const emptyHearingFormValues: HearingPayload = {
  type: '',
  scheduledAt: '',
  court: '',
  room: '',
  judgeName: '',
  notes: '',
}

export function validateHearingForm(values: HearingPayload): HearingFormErrors {
  const errors: HearingFormErrors = {}

  if (!values.type) errors.type = 'Select a hearing type.'

  if (!values.scheduledAt) {
    errors.scheduledAt = 'Date and time are required.'
  } else if (Number.isNaN(new Date(values.scheduledAt).getTime())) {
    errors.scheduledAt = 'Enter a valid date and time.'
  }

  if (!values.court.trim()) errors.court = 'Court or tribunal is required.'

  return errors
}

export function isHearingFormValid(values: HearingPayload) {
  return Object.keys(validateHearingForm(values)).length === 0
}
