import type { CaseStatus } from '@/features/cases/types'
import type { Invoice, PaymentSummary } from '@/shared/types/billing'
import type { FileRef } from '@/shared/types/files'

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

// Case, invoice, and file shapes are owned by their own modules so the clients
// screens stay in sync with them.
export type { CaseStatus, Invoice, PaymentSummary }
export type { InvoiceStatus } from '@/shared/types/billing'
export type ClientDocument = FileRef

export type ActivityType =
  | 'CASE_CREATED'
  | 'CASE_UPDATED'
  | 'MEETING_SCHEDULED'
  | 'DOCUMENT_UPLOADED'
  | 'INVOICE_ISSUED'
  | 'PAYMENT_RECEIVED'
  | 'NOTE_ADDED'
  | 'CLIENT_UPDATED'

export interface Address {
  country: string
  city: string
  street: string
  postalCode: string
}

export interface Tag {
  id: string
  label: string
}

export interface ClientCaseStats {
  activeCases: number
  closedCases: number
}

export interface ClientCase {
  id: string
  reference: string
  title: string
  status: CaseStatus
  practiceArea?: string | null
  leadAttorneyName?: string | null
  openedAt: string
  closedAt?: string | null
}

export interface ActivityAttachment {
  id: string
  fileName: string
}

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description?: string | null
  actorName?: string | null
  caseReference?: string | null
  caseId?: string | null
  attachments?: ActivityAttachment[]
  occurredAt: string
}

/** Row shape used by the clients list. */
export interface Client {
  id: string
  firstName: string
  lastName: string
  fullName: string
  companyName?: string | null
  occupation?: string | null
  email: string
  phone: string
  status: ClientStatus
  city?: string | null
  country?: string | null
  tags: Tag[]
  stats: ClientCaseStats
  payments: PaymentSummary
  clientSince?: string | null
  createdAt: string
  updatedAt: string
}

/** Full aggregate used by the client details page. */
export interface ClientDetails extends Client {
  nationalId?: string | null
  dateOfBirth?: string | null
  address: Address
  notes?: string | null
  avatarUrl?: string | null
  activities: Activity[]
  cases: ClientCase[]
  invoices: Invoice[]
  documents: ClientDocument[]
}

/** Payload accepted by create/update — mirrors the form fields. */
export interface ClientPayload {
  firstName: string
  lastName: string
  companyName: string
  nationalId: string
  dateOfBirth: string
  email: string
  phone: string
  address: Address
  tags: string[]
  notes: string
}
