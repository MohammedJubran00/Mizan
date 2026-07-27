import type { ReadStream } from 'fs';

import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';
import { AppError } from '../../../shared/errors/AppError';
import type { AuthContext } from '../../../shared/types/auth-context';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type {
  CreateDocumentInput,
  ListDocumentsQuery,
  UpdateDocumentInput,
} from '../dto/document-request.dto';
import type {
  DocumentDto,
  DocumentFacetsDto,
  DocumentListResponseDto,
} from '../dto/document.dto';
import { categoryLabel, mapDocument } from '../mapper/document.mapper';
import type {
  DocumentRepository,
  UpdateDocumentRecord,
} from '../repositories/document.repository';
import type { DocumentStorageService } from '../storage/document-storage.service';

export interface UploadedPdf {
  originalName: string;
  mimeType: string;
  buffer: Buffer;
}

export interface DocumentFileStream {
  stream: ReadStream;
  document: DocumentDto;
  checksum: string | null;
}

export class DocumentService {
  constructor(
    private readonly repository: DocumentRepository,
    private readonly storage: DocumentStorageService,
    private readonly activityEngine?: ActivityEngineService,
    private readonly cacheInvalidator?: CacheInvalidator,
  ) {}

  async list(
    auth: AuthContext,
    query: ListDocumentsQuery,
  ): Promise<DocumentListResponseDto> {
    const monthStart = startOfMonth();

    const [{ rows, total }, summary, facets] = await Promise.all([
      this.repository.findMany(auth.workspaceId, query),
      this.repository.summarize(auth.workspaceId, monthStart),
      this.repository.facets(auth.workspaceId),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);

    return {
      success: true,
      items: rows.map(mapDocument),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
        hasMore: query.page < totalPages,
      },
      summary,
      facets: buildFacets(facets),
    };
  }

  async getById(auth: AuthContext, id: string): Promise<DocumentDto> {
    const row = await this.repository.findById(auth.workspaceId, id);

    if (!row) {
      throw new AppError(404, 'Document not found.');
    }

    return mapDocument(row);
  }

  async upload(
    auth: AuthContext,
    file: UploadedPdf,
    input: CreateDocumentInput,
  ): Promise<DocumentDto> {
    const links = await this.resolveLinks(auth.workspaceId, {
      caseId: input.caseId,
      clientId: input.clientId,
    });

    const stored = await this.storage.save({
      workspaceId: auth.workspaceId,
      buffer: file.buffer,
    });

    const title = input.title?.trim() || stripPdfExtension(file.originalName);

    try {
      const row = await this.repository.create({
        workspaceId: auth.workspaceId,
        caseId: links.caseId,
        clientId: links.clientId,
        uploadedById: auth.user.id,
        title,
        description: input.description ?? null,
        category: input.category,
        fileName: file.originalName,
        storageKey: stored.storageKey,
        mimeType: 'application/pdf',
        sizeBytes: stored.sizeBytes,
        checksum: stored.checksum,
      });

      await this.activityEngine?.recordDocumentUploaded({
        workspaceId: auth.workspaceId,
        actorId: auth.user.id,
        documentId: row.id,
        name: row.title,
      });
      await this.cacheInvalidator?.invalidateForMutation(
        auth.workspaceId,
        'DOCUMENT_UPLOADED',
      );

      return mapDocument(row);
    } catch (error) {
      // Never leave an orphaned file behind if the metadata write fails.
      await this.storage.remove(stored.storageKey);
      throw error;
    }
  }

  async update(
    auth: AuthContext,
    id: string,
    input: UpdateDocumentInput,
  ): Promise<DocumentDto> {
    const existing = await this.repository.findById(auth.workspaceId, id);

    if (!existing) {
      throw new AppError(404, 'Document not found.');
    }

    const data: UpdateDocumentRecord = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.category !== undefined) data.category = input.category;

    if (input.caseId !== undefined || input.clientId !== undefined) {
      const links = await this.resolveLinks(auth.workspaceId, {
        caseId:
          input.caseId !== undefined ? input.caseId : existing.caseId,
        clientId:
          input.clientId !== undefined ? input.clientId : existing.clientId,
      });
      if (input.caseId !== undefined) data.caseId = links.caseId;
      if (input.clientId !== undefined || input.caseId !== undefined) {
        data.clientId = links.clientId;
      }
    }

    const row = await this.repository.update(auth.workspaceId, id, data);

    await this.cacheInvalidator?.invalidateDomains(auth.workspaceId, [
      'documents',
      'cases',
      'clients',
    ]);

    return mapDocument(row);
  }

  async delete(auth: AuthContext, id: string): Promise<void> {
    const existing = await this.repository.findById(auth.workspaceId, id);

    if (!existing) {
      throw new AppError(404, 'Document not found.');
    }

    await this.repository.delete(existing.id);
    await this.storage.remove(existing.storageKey);

    await this.activityEngine?.recordDocumentDeleted({
      workspaceId: auth.workspaceId,
      actorId: auth.user.id,
      documentId: existing.id,
      name: existing.title,
    });
    await this.cacheInvalidator?.invalidateForMutation(
      auth.workspaceId,
      'DOCUMENT_DELETED',
    );
  }

  async openFile(auth: AuthContext, id: string): Promise<DocumentFileStream> {
    const row = await this.repository.findById(auth.workspaceId, id);

    if (!row) {
      throw new AppError(404, 'Document not found.');
    }

    if (!(await this.storage.exists(row.storageKey))) {
      throw new AppError(410, 'Document file is no longer available.');
    }

    return {
      stream: this.storage.createReadStream(row.storageKey),
      document: mapDocument(row),
      checksum: row.checksum,
    };
  }

  /**
   * Validates case/client IDs and, when a case is chosen without a client,
   * derives the case's client so the document appears on both sides.
   */
  private async resolveLinks(
    workspaceId: string,
    links: {
      caseId?: string | null;
      clientId?: string | null;
    },
  ): Promise<{ caseId: string | null; clientId: string | null }> {
    const caseId = links.caseId ?? null;
    let clientId = links.clientId ?? null;

    if (caseId && !(await this.repository.caseExists(workspaceId, caseId))) {
      throw new AppError(400, 'Linked case was not found in this workspace.');
    }

    if (clientId && !(await this.repository.clientExists(workspaceId, clientId))) {
      throw new AppError(400, 'Linked client was not found in this workspace.');
    }

    if (caseId && !clientId) {
      clientId = await this.repository.findCaseClientId(workspaceId, caseId);
    }

    return { caseId, clientId };
  }
}

function buildFacets(
  data: Awaited<ReturnType<DocumentRepository['facets']>>,
): DocumentFacetsDto {
  const caseCountMap = new Map(
    data.caseCounts
      .filter((row) => row.caseId)
      .map((row) => [row.caseId as string, row._count._all]),
  );
  const clientCountMap = new Map(
    data.clientCounts
      .filter((row) => row.clientId)
      .map((row) => [row.clientId as string, row._count._all]),
  );

  return {
    categories: data.categories.map((row) => ({
      id: row.category,
      label: categoryLabel(row.category),
      count: row._count._all,
    })),
    cases: data.caseRows.map((row) => ({
      id: row.id,
      label: row.caseNumber ? `${row.caseNumber} — ${row.title}` : row.title,
      count: caseCountMap.get(row.id) ?? 0,
      clientId: row.clientId,
    })),
    clients: data.clientRows.map((row) => ({
      id: row.id,
      label: row.name,
      count: clientCountMap.get(row.id) ?? 0,
    })),
  };
}

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function stripPdfExtension(name: string): string {
  return name.replace(/\.pdf$/i, '').trim() || 'Untitled document';
}
