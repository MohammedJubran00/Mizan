import type { BadgeVariant } from '@/shared/components/Badge'
import type { SelectOption } from '@/shared/components/Select'

import type {
  EventCategory,
  EventPriority,
  EventStatus,
  ParticipantResponse,
  ReminderMethod,
  ReminderOffset,
} from '../types'
import {
  EVENT_CATEGORIES,
  EVENT_PRIORITIES,
  EVENT_STATUSES,
  REMINDER_METHODS,
  REMINDER_OFFSETS,
} from '../types'

export const categoryLabels: Record<EventCategory, string> = {
  MEETING: 'Meeting',
  COURT_HEARING: 'Court hearing',
  DEADLINE: 'Deadline',
  REMINDER: 'Reminder',
  TASK: 'Task',
  CLIENT_MEETING: 'Client meeting',
  INTERNAL_MEETING: 'Internal meeting',
  CONSULTATION: 'Consultation',
  DEPOSITION: 'Deposition',
  DISCOVERY: 'Discovery',
}

/**
 * Category colours are composed from the existing theme tokens only, so the
 * palette stays in sync with the rest of the application.
 */
interface CategoryTone {
  /** Solid dot / accent bar. */
  dot: string
  /** Chip background + text used on calendar surfaces. */
  chip: string
  /** Left border accent for event blocks. */
  accent: string
}

export const categoryTones: Record<EventCategory, CategoryTone> = {
  MEETING: {
    dot: 'bg-blue',
    chip: 'bg-blue-soft text-navy',
    accent: 'border-l-blue',
  },
  COURT_HEARING: {
    dot: 'bg-navy',
    chip: 'bg-navy/10 text-navy',
    accent: 'border-l-navy',
  },
  DEADLINE: {
    dot: 'bg-danger',
    chip: 'bg-danger/10 text-danger',
    accent: 'border-l-danger',
  },
  REMINDER: {
    dot: 'bg-warning',
    chip: 'bg-warning/10 text-warning',
    accent: 'border-l-warning',
  },
  TASK: {
    dot: 'bg-gold-dark',
    chip: 'bg-gold/15 text-gold-dark',
    accent: 'border-l-gold-dark',
  },
  CLIENT_MEETING: {
    dot: 'bg-success',
    chip: 'bg-success/10 text-success',
    accent: 'border-l-success',
  },
  INTERNAL_MEETING: {
    dot: 'bg-navy-muted',
    chip: 'bg-navy-muted/10 text-navy-muted',
    accent: 'border-l-navy-muted',
  },
  CONSULTATION: {
    dot: 'bg-blue-bright',
    chip: 'bg-blue-bright/10 text-blue-bright',
    accent: 'border-l-blue-bright',
  },
  DEPOSITION: {
    dot: 'bg-gold',
    chip: 'bg-gold/15 text-gold-dark',
    accent: 'border-l-gold',
  },
  DISCOVERY: {
    dot: 'bg-text-secondary',
    chip: 'bg-surface-muted text-text-secondary',
    accent: 'border-l-text-secondary',
  },
}

export const priorityLabels: Record<EventPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const priorityVariants: Record<EventPriority, BadgeVariant> = {
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
}

export const statusLabels: Record<EventStatus, string> = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const statusVariants: Record<EventStatus, BadgeVariant> = {
  SCHEDULED: 'info',
  CONFIRMED: 'accent',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
}

export const reminderMethodLabels: Record<ReminderMethod, string> = {
  EMAIL: 'Email',
  SMS: 'SMS',
  PUSH: 'Push notification',
  NONE: 'No reminder',
}

export const reminderOffsetLabels: Record<ReminderOffset, string> = {
  '0': 'At start time',
  '5': '5 minutes before',
  '15': '15 minutes before',
  '30': '30 minutes before',
  '60': '1 hour before',
  '120': '2 hours before',
  '1440': '1 day before',
  '2880': '2 days before',
}

export const participantResponseLabels: Record<ParticipantResponse, string> = {
  PENDING: 'Awaiting reply',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
}

export const participantResponseVariants: Record<
  ParticipantResponse,
  BadgeVariant
> = {
  PENDING: 'neutral',
  ACCEPTED: 'success',
  DECLINED: 'danger',
}

function toOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): SelectOption[] {
  return values.map((value) => ({ value, label: labels[value] }))
}

export const categoryOptions = toOptions(EVENT_CATEGORIES, categoryLabels)
export const priorityOptions = toOptions(EVENT_PRIORITIES, priorityLabels)
export const statusOptions = toOptions(EVENT_STATUSES, statusLabels)
export const reminderMethodOptions = toOptions(
  REMINDER_METHODS,
  reminderMethodLabels,
)
export const reminderOffsetOptions = toOptions(
  REMINDER_OFFSETS,
  reminderOffsetLabels,
)

export function reminderSummary(
  offsetMinutes: number | null,
  method: ReminderMethod | '',
) {
  if (method === 'NONE' || method === '' || offsetMinutes === null) {
    return 'No reminder set'
  }

  const key = String(offsetMinutes) as ReminderOffset
  const offsetLabel = reminderOffsetLabels[key] ?? `${offsetMinutes} minutes before`
  return `${offsetLabel} · ${reminderMethodLabels[method]}`
}
