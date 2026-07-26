import type { DocumentDto } from '../dto/document.dto';
import type { DocumentRow } from '../repositories/document.repository';

export function mapDocument(row: DocumentRow): DocumentDto {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    caseId: row.caseId,
    caseTitle: row.case?.title ?? null,
    caseNumber: row.case?.caseNumber ?? null,
    clientId: row.clientId,
    clientName: row.client?.name ?? null,
    uploadedBy: row.uploadedBy
      ? { id: row.uploadedBy.id, fullName: row.uploadedBy.fullName }
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  PLEADING: 'Pleading',
  CONTRACT: 'Contract',
  EVIDENCE: 'Evidence',
  CORRESPONDENCE: 'Correspondence',
  INVOICE: 'Invoice',
  REPORT: 'Report',
  OTHER: 'Other',
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
