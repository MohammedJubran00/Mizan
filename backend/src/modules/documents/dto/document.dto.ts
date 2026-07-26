import type { DocumentCategory } from '@prisma/client';

export interface DocumentUploaderDto {
  id: string;
  fullName: string;
}

export interface DocumentDto {
  id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  caseId: string | null;
  caseTitle: string | null;
  caseNumber: string | null;
  clientId: string | null;
  clientName: string | null;
  uploadedBy: DocumentUploaderDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentPaginationDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface DocumentFacetOptionDto {
  id: string;
  label: string;
  count: number;
}

/** Options for the desktop filter bar, derived from the workspace's documents. */
export interface DocumentFacetsDto {
  categories: DocumentFacetOptionDto[];
  cases: DocumentFacetOptionDto[];
  clients: DocumentFacetOptionDto[];
}

export interface DocumentSummaryDto {
  total: number;
  totalSizeBytes: number;
  uploadedThisMonth: number;
  unlinkedCount: number;
}

export interface DocumentListResponseDto {
  success: true;
  items: DocumentDto[];
  pagination: DocumentPaginationDto;
  summary: DocumentSummaryDto;
  facets: DocumentFacetsDto;
}

export interface DocumentResponseDto {
  success: true;
  document: DocumentDto;
}
