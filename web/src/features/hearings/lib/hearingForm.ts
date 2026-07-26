import type {
  HearingDetails,
  HearingDurationMinutes,
  HearingPayload,
} from '../types'

export interface HearingFormValues {
  caseId: string
  caseLabel: string
  clientName: string
  court: string
  room: string
  judgeName: string
  date: string
  time: string
  durationMinutes: HearingDurationMinutes | ''
  leadLawyerId: string
  leadLawyerName: string
  type: HearingPayload['type']
  notes: string
  notifyClient: boolean
  reminderDate: string
  notifyEmail: boolean
  notifySms: boolean
}

export type HearingFormField = keyof HearingFormValues
export type HearingFormErrors = Partial<Record<HearingFormField, string>>

export const emptyHearingFormValues: HearingFormValues = {
  caseId: '',
  caseLabel: '',
  clientName: '',
  court: '',
  room: '',
  judgeName: '',
  date: '',
  time: '',
  durationMinutes: '60',
  leadLawyerId: '',
  leadLawyerName: '',
  type: '',
  notes: '',
  notifyClient: true,
  reminderDate: '',
  notifyEmail: true,
  notifySms: false,
}

export function validateHearingForm(values: HearingFormValues): HearingFormErrors {
  const errors: HearingFormErrors = {}

  if (!values.caseId) errors.caseId = 'Select the case for this hearing.'
  if (!values.court.trim()) errors.court = 'Court name is required.'
  if (!values.date) {
    errors.date = 'Hearing date is required.'
  } else if (Number.isNaN(new Date(values.date).getTime())) {
    errors.date = 'Enter a valid date.'
  }

  if (!values.time) {
    errors.time = 'Hearing time is required.'
  } else if (!/^\d{2}:\d{2}$/.test(values.time)) {
    errors.time = 'Enter a valid time.'
  }

  if (!values.durationMinutes) errors.durationMinutes = 'Select a duration.'
  if (!values.type) errors.type = 'Select a hearing type.'

  if (values.notifyClient && !values.reminderDate) {
    errors.reminderDate = 'Choose a reminder date when notifying the client.'
  } else if (values.reminderDate && values.date) {
    const reminder = new Date(values.reminderDate)
    const hearing = new Date(values.date)
    if (Number.isNaN(reminder.getTime())) {
      errors.reminderDate = 'Enter a valid reminder date.'
    } else if (reminder > hearing) {
      errors.reminderDate = 'Reminder must be on or before the hearing date.'
    }
  }

  if (values.notifyClient && !values.notifyEmail && !values.notifySms) {
    errors.notifyEmail = 'Choose at least one notification channel.'
  }

  return errors
}

export function isHearingFormValid(values: HearingFormValues) {
  return Object.keys(validateHearingForm(values)).length === 0
}

export function toHearingPayload(values: HearingFormValues): HearingPayload {
  return {
    caseId: values.caseId,
    type: values.type,
    date: values.date,
    time: values.time,
    durationMinutes: values.durationMinutes,
    court: values.court.trim(),
    room: values.room.trim(),
    judgeName: values.judgeName.trim(),
    leadLawyerId: values.leadLawyerId,
    notes: values.notes.trim(),
    notifyClient: values.notifyClient,
    reminderDate: values.reminderDate,
    notifyEmail: values.notifyEmail,
    notifySms: values.notifySms,
  }
}

export function toHearingFormValues(details: HearingDetails): HearingFormValues {
  const scheduled = new Date(details.scheduledAt)
  const date = Number.isNaN(scheduled.getTime())
    ? ''
    : scheduled.toISOString().slice(0, 10)
  const time = Number.isNaN(scheduled.getTime())
    ? ''
    : scheduled.toTimeString().slice(0, 5)

  return {
    caseId: details.caseRef?.id ?? '',
    caseLabel: details.caseRef
      ? `${details.caseRef.caseNumber} — ${details.caseRef.title}`
      : '',
    clientName: details.client?.fullName ?? '',
    court: details.court ?? '',
    room: details.room ?? '',
    judgeName: details.judgeName ?? '',
    date,
    time,
    durationMinutes: details.durationMinutes
      ? (String(details.durationMinutes) as HearingFormValues['durationMinutes'])
      : '60',
    leadLawyerId: details.leadLawyer?.id ?? '',
    leadLawyerName: details.leadLawyer?.fullName ?? '',
    type: details.type,
    notes: details.notes ?? details.summary ?? '',
    notifyClient: details.reminder?.notifyClient ?? true,
    reminderDate: details.reminder?.date?.slice(0, 10) ?? '',
    notifyEmail: details.reminder?.email ?? true,
    notifySms: details.reminder?.sms ?? false,
  }
}
