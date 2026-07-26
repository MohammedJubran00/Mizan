import type {
  EventDetails,
  EventPayload,
  EventPersonRef,
  ReminderMethod,
} from '../types'
import {
  combineDateTime,
  toDateInputValue,
  toTimeInputValue,
} from './calendarDates'

export const MAX_ATTACHMENT_MB = 15

export const ACCEPTED_ATTACHMENT_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export interface EventFormValues {
  title: string
  category: EventPayload['category']
  priority: EventPayload['priority']
  status: EventPayload['status']
  description: string
  clientId: string
  clientName: string
  caseId: string
  caseLabel: string
  leadLawyerId: string
  leadLawyerName: string
  participants: EventPersonRef[]
  date: string
  startTime: string
  endTime: string
  allDay: boolean
  locationName: string
  locationAddress: string
  locationRoom: string
  locationVirtualUrl: string
  reminderOffset: string
  reminderMethod: ReminderMethod | ''
  notes: string
}

export type EventFormField = keyof Omit<EventFormValues, 'participants'>

export type EventFormErrors = Partial<Record<EventFormField, string>>

export const emptyEventFormValues: EventFormValues = {
  title: '',
  category: '',
  priority: 'MEDIUM',
  status: 'SCHEDULED',
  description: '',
  clientId: '',
  clientName: '',
  caseId: '',
  caseLabel: '',
  leadLawyerId: '',
  leadLawyerName: '',
  participants: [],
  date: '',
  startTime: '',
  endTime: '',
  allDay: false,
  locationName: '',
  locationAddress: '',
  locationRoom: '',
  locationVirtualUrl: '',
  reminderOffset: '30',
  reminderMethod: 'EMAIL',
  notes: '',
}

const TIME_PATTERN = /^\d{2}:\d{2}$/

export function validateEventForm(values: EventFormValues): EventFormErrors {
  const errors: EventFormErrors = {}

  if (!values.title.trim()) {
    errors.title = 'Event title is required.'
  } else if (values.title.trim().length < 3) {
    errors.title = 'Use at least 3 characters.'
  }

  if (!values.category) errors.category = 'Select an event type.'
  if (!values.priority) errors.priority = 'Select a priority.'
  if (!values.status) errors.status = 'Select a status.'

  if (!values.date) {
    errors.date = 'Event date is required.'
  } else if (Number.isNaN(new Date(values.date).getTime())) {
    errors.date = 'Enter a valid date.'
  }

  if (!values.allDay) {
    if (!values.startTime) {
      errors.startTime = 'Start time is required.'
    } else if (!TIME_PATTERN.test(values.startTime)) {
      errors.startTime = 'Enter a valid time.'
    }

    if (!values.endTime) {
      errors.endTime = 'End time is required.'
    } else if (!TIME_PATTERN.test(values.endTime)) {
      errors.endTime = 'Enter a valid time.'
    }

    const start = combineDateTime(values.date, values.startTime)
    const end = combineDateTime(values.date, values.endTime)

    if (start && end && end <= start) {
      errors.endTime = 'End time must be after the start time.'
    }
  }

  if (
    values.locationVirtualUrl &&
    !/^https?:\/\/\S+$/i.test(values.locationVirtualUrl.trim())
  ) {
    errors.locationVirtualUrl = 'Enter a valid http(s) link.'
  }

  if (values.reminderMethod && values.reminderMethod !== 'NONE') {
    if (!values.reminderOffset) {
      errors.reminderOffset = 'Choose when the reminder should fire.'
    }
  }

  return errors
}

export function isEventFormValid(values: EventFormValues) {
  return Object.keys(validateEventForm(values)).length === 0
}

/** Rejects files the API would refuse, before any upload is attempted. */
export function validateAttachment(file: File): string | null {
  if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
    return `${file.name} is larger than ${MAX_ATTACHMENT_MB} MB.`
  }

  if (file.type && !ACCEPTED_ATTACHMENT_TYPES.includes(file.type)) {
    return `${file.name} is not a supported file type.`
  }

  return null
}

export function toEventPayload(values: EventFormValues): EventPayload {
  const noReminder = !values.reminderMethod || values.reminderMethod === 'NONE'

  return {
    title: values.title.trim(),
    category: values.category,
    priority: values.priority,
    status: values.status,
    description: values.description.trim(),
    clientId: values.clientId,
    caseId: values.caseId,
    leadLawyerId: values.leadLawyerId,
    participantIds: values.participants.map((person) => person.id),
    date: values.date,
    startTime: values.allDay ? '' : values.startTime,
    endTime: values.allDay ? '' : values.endTime,
    allDay: values.allDay,
    location: {
      name: values.locationName.trim(),
      address: values.locationAddress.trim(),
      room: values.locationRoom.trim(),
      virtualUrl: values.locationVirtualUrl.trim(),
    },
    reminderOffsetMinutes: noReminder ? null : Number(values.reminderOffset),
    reminderMethod: values.reminderMethod,
    notes: values.notes.trim(),
  }
}

export function toEventFormValues(event: EventDetails): EventFormValues {
  const start = new Date(event.startAt)
  const end = new Date(event.endAt)
  const validStart = !Number.isNaN(start.getTime())
  const validEnd = !Number.isNaN(end.getTime())

  return {
    title: event.title,
    category: event.category,
    priority: event.priority,
    status: event.status,
    description: event.description ?? '',
    clientId: event.client?.id ?? '',
    clientName: event.client?.fullName ?? '',
    caseId: event.caseRef?.id ?? '',
    caseLabel: event.caseRef
      ? `${event.caseRef.caseNumber} — ${event.caseRef.title}`
      : '',
    leadLawyerId: event.leadLawyer?.id ?? '',
    leadLawyerName: event.leadLawyer?.fullName ?? '',
    participants: event.participants.map((participant) => ({
      id: participant.id,
      fullName: participant.fullName,
      email: participant.email,
      subtitle: participant.subtitle,
    })),
    date: validStart ? toDateInputValue(start) : '',
    startTime: validStart && !event.allDay ? toTimeInputValue(start) : '',
    endTime: validEnd && !event.allDay ? toTimeInputValue(end) : '',
    allDay: event.allDay,
    locationName: event.location?.name ?? '',
    locationAddress: event.location?.address ?? '',
    locationRoom: event.location?.room ?? '',
    locationVirtualUrl: event.location?.virtualUrl ?? '',
    reminderOffset:
      event.reminder && event.reminder.method !== 'NONE'
        ? String(event.reminder.offsetMinutes)
        : '30',
    reminderMethod: event.reminder?.method ?? 'NONE',
    notes: event.notes ?? '',
  }
}
