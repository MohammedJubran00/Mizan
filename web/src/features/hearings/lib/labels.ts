import type { BadgeVariant } from '@/shared/components/Badge'
import type { SelectOption } from '@/shared/components/Select'

import type {
  HearingDurationMinutes,
  HearingNextAction,
  HearingOutcome,
  HearingStatus,
  HearingType,
} from '../types'
import {
  HEARING_DURATIONS,
  HEARING_OUTCOMES,
  HEARING_STATUSES,
  HEARING_TYPES,
  NEXT_ACTIONS,
} from '../types'

export const hearingStatusLabels: Record<HearingStatus, string> = {
  UPCOMING: 'Upcoming',
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  POSTPONED: 'Postponed',
  CANCELLED: 'Cancelled',
}

export const hearingStatusVariants: Record<HearingStatus, BadgeVariant> = {
  UPCOMING: 'warning',
  SCHEDULED: 'info',
  COMPLETED: 'success',
  POSTPONED: 'danger',
  CANCELLED: 'neutral',
}

export const hearingTypeLabels: Record<HearingType, string> = {
  INITIAL_SCHEDULING: 'Initial scheduling',
  STATUS_CONFERENCE: 'Status conference',
  MOTION: 'Motion',
  PRELIMINARY: 'Preliminary hearing',
  SETTLEMENT_MEDIATION: 'Settlement mediation',
  DEPOSITION: 'Deposition',
  TRIAL: 'Trial',
  SENTENCING: 'Sentencing',
  OTHER: 'Other',
}

export const hearingOutcomeLabels: Record<HearingOutcome, string> = {
  WON: 'Won',
  SETTLED: 'Settled',
  LOST: 'Lost',
}

export const hearingOutcomeVariants: Record<HearingOutcome, BadgeVariant> = {
  WON: 'success',
  SETTLED: 'info',
  LOST: 'danger',
}

export const nextActionLabels: Record<HearingNextAction, string> = {
  FILE_MOTION: 'File motion',
  DRAFT_ORDER: 'Draft order',
  NOTIFY_CLIENT: 'Notify client',
  PREPARE_BRIEF: 'Prepare brief',
  SCHEDULE_FOLLOW_UP: 'Schedule follow-up',
  OTHER: 'Other',
}

export const durationLabels: Record<HearingDurationMinutes, string> = {
  '15': '15 minutes',
  '30': '30 minutes',
  '45': '45 minutes',
  '60': '1 hour',
  '90': '1.5 hours',
  '120': '2 hours',
  '180': '3 hours',
  '240': '4 hours',
}

function toOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): SelectOption[] {
  return values.map((value) => ({ value, label: labels[value] }))
}

export const hearingStatusOptions = toOptions(HEARING_STATUSES, hearingStatusLabels)
export const hearingTypeOptions = toOptions(HEARING_TYPES, hearingTypeLabels)
export const hearingOutcomeOptions = toOptions(HEARING_OUTCOMES, hearingOutcomeLabels)
export const nextActionOptions = toOptions(NEXT_ACTIONS, nextActionLabels)
export const durationOptions = toOptions(HEARING_DURATIONS, durationLabels)

export const HEARING_SORT_OPTIONS = [
  { value: 'scheduledAt:asc', label: 'Sort by: Soonest' },
  { value: 'scheduledAt:desc', label: 'Sort by: Latest' },
  { value: 'caseTitle:asc', label: 'Sort by: Case title' },
  { value: 'court:asc', label: 'Sort by: Court' },
  { value: 'status:asc', label: 'Sort by: Status' },
  { value: 'type:asc', label: 'Sort by: Type' },
] as const

export type HearingSortValue = (typeof HEARING_SORT_OPTIONS)[number]['value']

export const hearingSortOptions: SelectOption[] = HEARING_SORT_OPTIONS.map(
  (option) => ({ value: option.value, label: option.label }),
)

export function formatDuration(minutes?: number | null) {
  if (!minutes) return '—'
  const key = String(minutes) as HearingDurationMinutes
  return durationLabels[key] ?? `${minutes} minutes`
}
