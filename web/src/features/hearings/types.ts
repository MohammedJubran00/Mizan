import type { FileRef } from '@/shared/types/files'

export const HEARING_STATUSES = [
  'UPCOMING',
  'SCHEDULED',
  'COMPLETED',
  'POSTPONED',
  'CANCELLED',
] as const

export type HearingStatus = (typeof HEARING_STATUSES)[number]

export const HEARING_TYPES = [
  'INITIAL_SCHEDULING',
  'STATUS_CONFERENCE',
  'MOTION',
  'PRELIMINARY',
  'SETTLEMENT_MEDIATION',
  'DEPOSITION',
  'TRIAL',
  'SENTENCING',
  'OTHER',
] as const

export type HearingType = (typeof HEARING_TYPES)[number]

export const HEARING_OUTCOMES = ['WON', 'SETTLED', 'LOST'] as const

export type HearingOutcome = (typeof HEARING_OUTCOMES)[number]

export const HEARING_DURATIONS = [
  '15',
  '30',
  '45',
  '60',
  '90',
  '120',
  '180',
  '240',
] as const

export type HearingDurationMinutes = (typeof HEARING_DURATIONS)[number]

export const NEXT_ACTIONS = [
  'FILE_MOTION',
  'DRAFT_ORDER',
  'NOTIFY_CLIENT',
  'PREPARE_BRIEF',
  'SCHEDULE_FOLLOW_UP',
  'OTHER',
] as const

export type HearingNextAction = (typeof NEXT_ACTIONS)[number]

export type HearingSortField =
  | 'scheduledAt'
  | 'caseTitle'
  | 'court'
  | 'status'
  | 'type'

export type SortDirection = 'asc' | 'desc'

export type CalendarViewMode = 'day' | 'week' | 'month'

export interface HearingPersonRef {
  id: string
  fullName: string
  email?: string | null
  phone?: string | null
  subtitle?: string | null
  avatarUrl?: string | null
}

export interface HearingCaseRef {
  id: string
  caseNumber: string
  title: string
  practiceArea?: string | null
}

export interface HearingPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface HearingListItem {
  id: string
  type: HearingType
  status: HearingStatus
  scheduledAt: string
  durationMinutes?: number | null
  court?: string | null
  room?: string | null
  judgeName?: string | null
  caseRef: HearingCaseRef | null
  client: HearingPersonRef | null
  leadLawyer: HearingPersonRef | null
  createdAt: string
  updatedAt: string
}

export interface HearingListResponse {
  items: HearingListItem[]
  pagination: HearingPagination
}

export interface HearingStatsSummary {
  totalHearings: number
  todayHearings: number
  upcomingHearings: number
  completedHearings: number
  postponedHearings: number
}

export interface HearingReminder {
  date: string
  notifyClient: boolean
  email: boolean
  sms: boolean
}

export interface HearingOutcomeRecord {
  result: HearingOutcome
  judgeDecision?: string | null
  summary?: string | null
  nextAction?: HearingNextAction | null
  scheduleFollowUp: boolean
  recordedAt: string
}

export interface HearingPendingAction {
  id: string
  label: string
  completed: boolean
  dueAt?: string | null
}

export interface HearingTimelineEvent {
  id: string
  title: string
  description?: string | null
  actorName?: string | null
  occurredAt: string
}

export interface HearingNote {
  id: string
  title?: string | null
  body: string
  authorName?: string | null
  createdAt: string
}

export interface HearingDetails {
  id: string
  type: HearingType
  status: HearingStatus
  scheduledAt: string
  durationMinutes?: number | null
  court?: string | null
  courtAddress?: string | null
  room?: string | null
  judgeName?: string | null
  judgeTenure?: string | null
  notes?: string | null
  summary?: string | null
  caseRef: HearingCaseRef | null
  client: HearingPersonRef | null
  leadLawyer: HearingPersonRef | null
  reminder: HearingReminder | null
  outcome: HearingOutcomeRecord | null
  pendingActions: HearingPendingAction[]
  nextHearingAt?: string | null
  nextActionLabel?: string | null
  nextActionDueAt?: string | null
  timeline: HearingTimelineEvent[]
  documents: FileRef[]
  notesList: HearingNote[]
  transcriptUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface HearingPayload {
  caseId: string
  type: HearingType | ''
  date: string
  time: string
  durationMinutes: HearingDurationMinutes | ''
  court: string
  room: string
  judgeName: string
  leadLawyerId: string
  notes: string
  notifyClient: boolean
  reminderDate: string
  notifyEmail: boolean
  notifySms: boolean
}

export interface HearingOutcomePayload {
  result: HearingOutcome | ''
  judgeDecision: string
  summary: string
  nextAction: HearingNextAction | ''
  scheduleFollowUp: boolean
}

export interface HearingReschedulePayload {
  date: string
  time: string
  reason: string
  notifyClient: boolean
}

export interface CalendarEvent {
  id: string
  hearingId: string
  title: string
  caseNumber?: string | null
  scheduledAt: string
  endAt?: string | null
  court?: string | null
  room?: string | null
  status: HearingStatus
  type: HearingType
}

export interface CapacityInsight {
  label: string
  headline: string
  description: string
  trendPercent?: number | null
}

export interface CalendarResponse {
  events: CalendarEvent[]
  upcoming: HearingListItem[]
  capacity: CapacityInsight | null
}
