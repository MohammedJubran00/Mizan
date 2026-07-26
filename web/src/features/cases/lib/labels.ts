import type { BadgeVariant } from '@/shared/components/Badge'
import type { SelectOption } from '@/shared/components/Select'

import type {
  CasePriority,
  CaseStatus,
  DeadlineStatus,
  HearingStatus,
  HearingType,
  PracticeArea,
} from '../types'
import {
  CASE_PRIORITIES,
  CASE_STATUSES,
  HEARING_TYPES,
  PRACTICE_AREAS,
} from '../types'

export const caseStatusLabels: Record<CaseStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  PENDING: 'Pending',
  ON_HOLD: 'On hold',
  CLOSED: 'Closed',
  DISMISSED: 'Dismissed',
  ARCHIVED: 'Archived',
}

/** Short helper copy shown in the status picker. */
export const caseStatusDescriptions: Record<CaseStatus, string> = {
  OPEN: 'Newly created and awaiting initial review.',
  IN_PROGRESS: 'Actively being worked on by the assigned team.',
  PENDING: 'Awaiting external information or client feedback.',
  ON_HOLD: 'Temporarily suspended due to external constraints.',
  CLOSED: 'Resolved with all billing finalised.',
  DISMISSED: 'Dropped or rejected by the court or the firm.',
  ARCHIVED: 'Moved to long-term digital storage.',
}

export const caseStatusVariants: Record<CaseStatus, BadgeVariant> = {
  OPEN: 'info',
  IN_PROGRESS: 'info',
  PENDING: 'warning',
  ON_HOLD: 'warning',
  CLOSED: 'success',
  DISMISSED: 'danger',
  ARCHIVED: 'neutral',
}

export const casePriorityLabels: Record<CasePriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const casePriorityVariants: Record<CasePriority, BadgeVariant> = {
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
}

export const practiceAreaLabels: Record<PracticeArea, string> = {
  CORPORATE: 'Corporate law',
  LITIGATION: 'Litigation',
  FAMILY: 'Family law',
  REAL_ESTATE: 'Real estate',
  CRIMINAL: 'Criminal defence',
  EMPLOYMENT: 'Employment',
  INTELLECTUAL_PROPERTY: 'Intellectual property',
  TAX: 'Tax',
  IMMIGRATION: 'Immigration',
  OTHER: 'Other',
}

export const hearingStatusLabels: Record<HearingStatus, string> = {
  UPCOMING: 'Upcoming',
  SCHEDULED: 'Scheduled',
  CONCLUDED: 'Concluded',
  ADJOURNED: 'Adjourned',
  CANCELLED: 'Cancelled',
}

export const hearingStatusVariants: Record<HearingStatus, BadgeVariant> = {
  UPCOMING: 'warning',
  SCHEDULED: 'info',
  CONCLUDED: 'success',
  ADJOURNED: 'neutral',
  CANCELLED: 'danger',
}

export const hearingTypeLabels: Record<HearingType, string> = {
  INITIAL_SCHEDULING: 'Initial scheduling',
  STATUS_CONFERENCE: 'Status conference',
  MOTION: 'Motion',
  SETTLEMENT_MEDIATION: 'Settlement mediation',
  TRIAL: 'Trial',
  SENTENCING: 'Sentencing',
  OTHER: 'Other',
}

export const deadlineStatusLabels: Record<DeadlineStatus, string> = {
  PENDING: 'Pending',
  UPCOMING: 'Upcoming',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue',
}

export const deadlineStatusVariants: Record<DeadlineStatus, BadgeVariant> = {
  PENDING: 'neutral',
  UPCOMING: 'info',
  COMPLETED: 'success',
  OVERDUE: 'danger',
}

function toOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): SelectOption[] {
  return values.map((value) => ({ value, label: labels[value] }))
}

export const caseStatusOptions = toOptions(CASE_STATUSES, caseStatusLabels)
export const casePriorityOptions = toOptions(CASE_PRIORITIES, casePriorityLabels)
export const practiceAreaOptions = toOptions(PRACTICE_AREAS, practiceAreaLabels)
export const hearingTypeOptions = toOptions(HEARING_TYPES, hearingTypeLabels)

export const CASE_SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Sort by: Newest' },
  { value: 'createdAt:asc', label: 'Sort by: Oldest' },
  { value: 'caseNumber:asc', label: 'Sort by: Case number' },
  { value: 'title:asc', label: 'Sort by: Title (A–Z)' },
  { value: 'nextHearingAt:asc', label: 'Sort by: Next hearing' },
] as const

export type CaseSortValue = (typeof CASE_SORT_OPTIONS)[number]['value']

export const caseSortOptions: SelectOption[] = CASE_SORT_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}))
