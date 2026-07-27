export const DOCUMENT_CATEGORIES = [
  'PLEADING',
  'CONTRACT',
  'EVIDENCE',
  'CORRESPONDENCE',
  'INVOICE',
  'REPORT',
  'OTHER',
] as const

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  PLEADING: 'Pleading',
  CONTRACT: 'Contract',
  EVIDENCE: 'Evidence',
  CORRESPONDENCE: 'Correspondence',
  INVOICE: 'Invoice',
  REPORT: 'Report',
  OTHER: 'Other',
}

export type DocumentSortField = 'createdAt' | 'title' | 'sizeBytes' | 'category'
export type SortDirection = 'asc' | 'desc'

export interface DocumentItem {
  id: string
  title: string
  description: string | null
  category: DocumentCategory
  fileName: string
  mimeType: string
  sizeBytes: number
  caseId: string | null
  caseTitle: string | null
  caseNumber: string | null
  clientId: string | null
  clientName: string | null
  uploadedBy: { id: string; fullName: string } | null
  createdAt: string
  updatedAt: string
}

export interface DocumentPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface DocumentFacetOption {
  id: string
  label: string
  count: number
  /** On case options: the case's client, used to auto-link on upload. */
  clientId?: string | null
}

export interface DocumentFacets {
  categories: DocumentFacetOption[]
  cases: DocumentFacetOption[]
  clients: DocumentFacetOption[]
}

export interface DocumentSummary {
  total: number
  totalSizeBytes: number
  uploadedThisMonth: number
  unlinkedCount: number
}

export interface DocumentListResponse {
  success: true
  items: DocumentItem[]
  pagination: DocumentPagination
  summary: DocumentSummary
  facets: DocumentFacets
}

export interface DocumentListParams {
  search?: string
  category?: DocumentCategory | ''
  caseId?: string
  clientId?: string
  sortBy: DocumentSortField
  sortDir: SortDirection
  page: number
  pageSize: number
}

export interface UploadDocumentPayload {
  file: File
  title?: string
  description?: string
  category: DocumentCategory
  caseId?: string
  clientId?: string
}

export interface UpdateDocumentPayload {
  title?: string
  description?: string | null
  category?: DocumentCategory
  caseId?: string | null
  clientId?: string | null
}
