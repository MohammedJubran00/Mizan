import type {
  HearingOutcome,
  HearingOutcomePayload,
  HearingReschedulePayload,
} from '../types'

export type OutcomeFormErrors = Partial<
  Record<keyof HearingOutcomePayload, string>
>

export const emptyOutcomeForm: HearingOutcomePayload = {
  result: '',
  judgeDecision: '',
  summary: '',
  nextAction: '',
  scheduleFollowUp: false,
}

export function validateOutcomeForm(
  values: HearingOutcomePayload,
): OutcomeFormErrors {
  const errors: OutcomeFormErrors = {}
  if (!values.result) errors.result = 'Select an outcome.'
  if (!values.judgeDecision.trim()) {
    errors.judgeDecision = 'Enter the judge’s decision.'
  }
  return errors
}

export function isOutcomeFormValid(values: HearingOutcomePayload) {
  return Object.keys(validateOutcomeForm(values)).length === 0
}

export type RescheduleFormErrors = Partial<
  Record<keyof HearingReschedulePayload, string>
>

export const emptyRescheduleForm: HearingReschedulePayload = {
  date: '',
  time: '',
  reason: '',
  notifyClient: true,
}

export function validateRescheduleForm(
  values: HearingReschedulePayload,
): RescheduleFormErrors {
  const errors: RescheduleFormErrors = {}

  if (!values.date) {
    errors.date = 'New date is required.'
  } else if (Number.isNaN(new Date(values.date).getTime())) {
    errors.date = 'Enter a valid date.'
  }

  if (!values.time) {
    errors.time = 'New time is required.'
  } else if (!/^\d{2}:\d{2}$/.test(values.time)) {
    errors.time = 'Enter a valid time.'
  }

  if (!values.reason.trim()) {
    errors.reason = 'Provide a reason for rescheduling.'
  }

  return errors
}

export function isRescheduleFormValid(values: HearingReschedulePayload) {
  return Object.keys(validateRescheduleForm(values)).length === 0
}

export function outcomeFromResult(
  result: HearingOutcome | '',
): HearingOutcome | null {
  return result || null
}
