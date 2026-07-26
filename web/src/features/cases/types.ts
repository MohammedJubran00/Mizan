import type { Invoice, PaymentSummary } from '@/shared/types/billing'
import type { FileRef } from '@/shared/types/files'

export const CASE_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'PENDING',
  'ON_HOLD',
  'CLOSED',
  'DISMISSED',
  'ARCHIVED',
] as const

export type CaseStatus = (typeof CASE_STATUSES)[number]

export const CASE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

export type CasePriority = (typeof CASE_PRIORITIES)[number]

export const PRACTICE_AREAS = [
  'CORPORATE',
  'LITIGATION',
  'FAMILY',
  'REAL_ESTATE',
  'CRIMINAL',
  'EMPLOYMENT',
  'INTELLECTUAL_PROPERTY',
  'TAX',
  'IMMIGRATION',
  'OTHER',
] as const

export type PracticeArea = (typeof PRACTICE_AREAS)[number]

export const HEARING_STATUSES = [
  'UPCOMING',
  'SCHEDULED',
  'CONCLUDED',
  'ADJOURNED',
  'CANCELLED',
] as const

export type HearingStatus = (typeof HEARING_STATUSES)[number]

export const HEARING_TYPES = [
  'INITIAL_SCHEDULING',
  'STATUS_CONFERENCE',
  'MOTION',
  'SETTLEMENT_MEDIATION',
  'TRIAL',
  'SENTENCING',
  'OTHER',
] as const

export type HearingType = (typeof HEARING_TYPES)[number]

export const DEADLINE_STATUSES = [
  'PENDING',
  'UPCOMING',
  'COMPLETED',
  'OVERDUE',
] as const

export type DeadlineStatus = (typeof DEADLINE_STATUSES)[number]

export type CaseSortField = 'createdAt' | 'caseNumber' | 'title' | 'nextHearingAt'
export type SortDirection = 'asc' | 'desc'

export interface CasePersonRef {
  id: string
  fullName: string
  email?: string | null
  phone?: string | null
  /** Company for clients, job title for lawyers. */
  subtitle?: string | null
  avatarUrl?: string | null
}

export interface CaseListItem {
  id: string
  caseNumber: string
  title: string
  status: CaseStatus
  priority: CasePriority
  practiceArea: PracticeArea
  client: CasePersonRef | null
  leadLawyer: CasePersonRef | null
  isLeadAssigned: boolean
  nextHearingAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface CasePagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface CaseListResponse {
  items: CaseListItem[]
  pagination: CasePagination
}

export interface CaseStatsSummary {
  totalCases: number
  activeCases: number
  closedCases: number
  upcomingHearings: number
}

export interface CaseMilestones {
  filingDate?: string | null
  nextHearingAt?: string | null
  filingDeadline?: string | null
  discoveryDeadline?: string | null
  expectedClosingAt?: string | null
}

export interface CaseDeadline {
  id: string
  label: string
  dueAt: string
  status: DeadlineStatus
  priority?: CasePriority | null
  note?: string | null
}

export interface CaseTimelineEvent {
  id: string
  title: string
  description?: string | null
  actorName?: string | null
  occurredAt: string
}

export interface CaseNote {
  id: string
  title?: string | null
  body: string
  authorName?: string | null
  shared: boolean
  createdAt: string
}

export interface Hearing {
  id: string
  caseId: string
  caseNumber?: string | null
  type: HearingType
  status: HearingStatus
  scheduledAt: string
  court?: string | null
  room?: string | null
  judgeName?: string | null
  notes?: string | null
  transcriptUrl?: string | null
  createdAt: string
}

export interface HearingListResponse {
  items: Hearing[]
  pagination: CasePagination
}

export interface CaseBillingSummary {
  totalBilled: number
  payments: PaymentSummary
  invoices: Invoice[]
}

export interface CaseCounters {
  hearings: number
  documents: number
  notes: number
}

export interface CaseDetails {
  id: string
  caseNumber: string
  title: string
  description?: string | null
  status: CaseStatus
  priority: CasePriority
  practiceArea: PracticeArea
  court?: string | null
  judgeName?: string | null
  opposingParty?: string | null
  opposingCounsel?: string | null
  jurisdiction?: string | null
  client: CasePersonRef | null
  leadLawyer: CasePersonRef | null
  team: CasePersonRef[]
  counters: CaseCounters
  billing: CaseBillingSummary
  milestones: CaseMilestones
  deadlines: CaseDeadline[]
  timeline: CaseTimelineEvent[]
  hearings: Hearing[]
  documents: FileRef[]
  notes: CaseNote[]
  createdAt: string
  updatedAt: string
}

export interface CasePayload {
  caseNumber: string
  title: string
  description: string
  practiceArea: PracticeArea | ''
  status: CaseStatus | ''
  priority: CasePriority | ''
  clientId: string
  court: string
  judgeName: string
  opposingParty: string
  opposingCounsel: string
  leadLawyerId: string
  teamMemberIds: string[]
  milestones: {
    filingDate: string
    nextHearingAt: string
    filingDeadline: string
  }
}

export interface HearingPayload {
  type: HearingType | ''
  scheduledAt: string
  court: string
  room: string
  judgeName: string
  notes: string
}
