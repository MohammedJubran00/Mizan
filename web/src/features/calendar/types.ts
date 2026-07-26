import type { FileRef } from '@/shared/types/files'

export const EVENT_CATEGORIES = [
  'MEETING',
  'COURT_HEARING',
  'DEADLINE',
  'REMINDER',
  'TASK',
  'CLIENT_MEETING',
  'INTERNAL_MEETING',
  'CONSULTATION',
  'DEPOSITION',
  'DISCOVERY',
] as const

export type EventCategory = (typeof EVENT_CATEGORIES)[number]

export const EVENT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

export type EventPriority = (typeof EVENT_PRIORITIES)[number]

export const EVENT_STATUSES = [
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
] as const

export type EventStatus = (typeof EVENT_STATUSES)[number]

export const REMINDER_METHODS = ['EMAIL', 'SMS', 'PUSH', 'NONE'] as const

export type ReminderMethod = (typeof REMINDER_METHODS)[number]

/** Minutes before the event start. */
export const REMINDER_OFFSETS = [
  '0',
  '5',
  '15',
  '30',
  '60',
  '120',
  '1440',
  '2880',
] as const

export type ReminderOffset = (typeof REMINDER_OFFSETS)[number]

export const PARTICIPANT_RESPONSES = ['PENDING', 'ACCEPTED', 'DECLINED'] as const

export type ParticipantResponse = (typeof PARTICIPANT_RESPONSES)[number]

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda'

export type EventSortField = 'startAt' | 'title' | 'priority' | 'category'
export type SortDirection = 'asc' | 'desc'

export interface EventPersonRef {
  id: string
  fullName: string
  email?: string | null
  phone?: string | null
  /** Company for clients, job title for team members. */
  subtitle?: string | null
  avatarUrl?: string | null
}

export interface EventCaseRef {
  id: string
  caseNumber: string
  title: string
}

export interface EventLocation {
  name: string
  address?: string | null
  room?: string | null
  virtualUrl?: string | null
}

export interface EventParticipant extends EventPersonRef {
  response: ParticipantResponse
  /** Distinguishes internal team members from external attendees. */
  external: boolean
}

export interface EventReminder {
  offsetMinutes: number
  method: ReminderMethod
  sentAt?: string | null
}

export interface EventAttachment extends FileRef {
  downloadUrl?: string | null
}

export interface EventCompletion {
  completedAt: string
  notes?: string | null
  completedByName?: string | null
}

/** A calendar the workspace can show events from (firm, personal, external). */
export interface CalendarSource {
  id: string
  name: string
  description?: string | null
  eventCount?: number | null
}

export interface CalendarEventItem {
  id: string
  title: string
  category: EventCategory
  priority: EventPriority
  status: EventStatus
  startAt: string
  endAt: string
  allDay: boolean
  location: EventLocation | null
  caseRef: EventCaseRef | null
  client: EventPersonRef | null
  leadLawyer: EventPersonRef | null
  participantCount: number
  calendarId?: string | null
  createdAt: string
  updatedAt: string
}

export interface EventPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface EventListResponse {
  items: CalendarEventItem[]
  pagination: EventPagination
}

export interface EventDetails extends CalendarEventItem {
  description?: string | null
  notes?: string | null
  participants: EventParticipant[]
  attachments: EventAttachment[]
  reminder: EventReminder | null
  completion: EventCompletion | null
}

export interface EventPayload {
  title: string
  category: EventCategory | ''
  priority: EventPriority | ''
  status: EventStatus | ''
  description: string
  clientId: string
  caseId: string
  leadLawyerId: string
  participantIds: string[]
  date: string
  startTime: string
  endTime: string
  allDay: boolean
  location: {
    name: string
    address: string
    room: string
    virtualUrl: string
  }
  reminderOffsetMinutes: number | null
  reminderMethod: ReminderMethod | ''
  notes: string
}

export interface EventCompletionPayload {
  completed: boolean
  notes: string
}

export interface EventReschedulePayload {
  date: string
  startTime: string
  endTime: string
  reason: string
  notifyParticipants: boolean
}
