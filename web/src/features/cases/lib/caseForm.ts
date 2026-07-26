import type {
  CaseDetails,
  CasePayload,
  CasePriority,
  CaseStatus,
  PracticeArea,
} from '../types'

export interface CaseFormValues {
  caseNumber: string
  title: string
  description: string
  practiceArea: PracticeArea | ''
  status: CaseStatus | ''
  priority: CasePriority | ''
  clientId: string
  /** Kept alongside the id so the picker can show a label without a refetch. */
  clientName: string
  court: string
  judgeName: string
  opposingParty: string
  opposingCounsel: string
  leadLawyerId: string
  leadLawyerName: string
  teamMemberIds: string[]
  teamMemberNames: string[]
  filingDate: string
  nextHearingAt: string
  filingDeadline: string
}

export type CaseFormField = keyof Omit<
  CaseFormValues,
  'teamMemberIds' | 'teamMemberNames'
>

export type CaseFormErrors = Partial<Record<CaseFormField, string>>

export const emptyCaseFormValues: CaseFormValues = {
  caseNumber: '',
  title: '',
  description: '',
  practiceArea: '',
  status: 'OPEN',
  priority: 'MEDIUM',
  clientId: '',
  clientName: '',
  court: '',
  judgeName: '',
  opposingParty: '',
  opposingCounsel: '',
  leadLawyerId: '',
  leadLawyerName: '',
  teamMemberIds: [],
  teamMemberNames: [],
  filingDate: '',
  nextHearingAt: '',
  filingDeadline: '',
}

const CASE_NUMBER_PATTERN = /^[\w\s./-]{3,32}$/

function parseDate(value: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function validateCaseForm(values: CaseFormValues): CaseFormErrors {
  const errors: CaseFormErrors = {}

  if (!values.title.trim()) {
    errors.title = 'Case title is required.'
  } else if (values.title.trim().length < 3) {
    errors.title = 'Use at least 3 characters.'
  }

  if (values.caseNumber && !CASE_NUMBER_PATTERN.test(values.caseNumber.trim())) {
    errors.caseNumber = 'Use letters, digits, and - . / only.'
  }

  if (!values.clientId) errors.clientId = 'Select the client for this matter.'
  if (!values.practiceArea) errors.practiceArea = 'Select a practice area.'
  if (!values.status) errors.status = 'Select an initial status.'
  if (!values.priority) errors.priority = 'Select a case priority.'

  const filingDate = parseDate(values.filingDate)
  const filingDeadline = parseDate(values.filingDeadline)
  const nextHearing = parseDate(values.nextHearingAt)

  if (values.filingDate && !filingDate) errors.filingDate = 'Enter a valid date.'
  if (filingDate && filingDate > startOfToday()) {
    errors.filingDate = 'Filing date cannot be in the future.'
  }

  if (!values.filingDeadline) {
    errors.filingDeadline = 'Filing deadline is required for procedural compliance.'
  } else if (!filingDeadline) {
    errors.filingDeadline = 'Enter a valid date.'
  } else if (filingDate && filingDeadline < filingDate) {
    errors.filingDeadline = 'Deadline cannot precede the filing date.'
  }

  if (values.nextHearingAt && !nextHearing) {
    errors.nextHearingAt = 'Enter a valid date.'
  } else if (nextHearing && filingDate && nextHearing < filingDate) {
    errors.nextHearingAt = 'Hearing cannot precede the filing date.'
  }

  return errors
}

export function isCaseFormValid(values: CaseFormValues) {
  return Object.keys(validateCaseForm(values)).length === 0
}

export function toCasePayload(values: CaseFormValues): CasePayload {
  return {
    caseNumber: values.caseNumber.trim(),
    title: values.title.trim(),
    description: values.description.trim(),
    practiceArea: values.practiceArea,
    status: values.status,
    priority: values.priority,
    clientId: values.clientId,
    court: values.court.trim(),
    judgeName: values.judgeName.trim(),
    opposingParty: values.opposingParty.trim(),
    opposingCounsel: values.opposingCounsel.trim(),
    leadLawyerId: values.leadLawyerId,
    teamMemberIds: values.teamMemberIds,
    milestones: {
      filingDate: values.filingDate,
      nextHearingAt: values.nextHearingAt,
      filingDeadline: values.filingDeadline,
    },
  }
}

export function toCaseFormValues(caseDetails: CaseDetails): CaseFormValues {
  return {
    caseNumber: caseDetails.caseNumber,
    title: caseDetails.title,
    description: caseDetails.description ?? '',
    practiceArea: caseDetails.practiceArea,
    status: caseDetails.status,
    priority: caseDetails.priority,
    clientId: caseDetails.client?.id ?? '',
    clientName: caseDetails.client?.fullName ?? '',
    court: caseDetails.court ?? '',
    judgeName: caseDetails.judgeName ?? '',
    opposingParty: caseDetails.opposingParty ?? '',
    opposingCounsel: caseDetails.opposingCounsel ?? '',
    leadLawyerId: caseDetails.leadLawyer?.id ?? '',
    leadLawyerName: caseDetails.leadLawyer?.fullName ?? '',
    teamMemberIds: caseDetails.team.map((member) => member.id),
    teamMemberNames: caseDetails.team.map((member) => member.fullName),
    filingDate: caseDetails.milestones.filingDate?.slice(0, 10) ?? '',
    nextHearingAt: caseDetails.milestones.nextHearingAt?.slice(0, 10) ?? '',
    filingDeadline: caseDetails.milestones.filingDeadline?.slice(0, 10) ?? '',
  }
}
