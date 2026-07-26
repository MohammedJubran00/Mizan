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
    await this.assertLinksBelongToWorkspace(auth.workspaceId, {
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
        caseId: input.caseId ?? null,
        clientId: input.clientId ?? null,
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

    await this.assertLinksBelongToWorkspace(auth.workspaceId, {
      caseId: input.caseId ?? undefined,
      clientId: input.clientId ?? undefined,
    });

    const data: UpdateDocumentRecord = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.category !== undefined) data.category = input.category;
    if (input.caseId !== undefined) data.caseId = input.caseId;
    if (input.clientId !== undefined) data.clientId = input.clientId;

    const row = await this.repository.update(auth.workspaceId, id, data);

    await this.cacheInvalidator?.invalidateDomains(auth.workspaceId, [
      'documents',
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

  private async assertLinksBelongToWorkspace(
    workspaceId: string,
    links: { caseId?: string; clientId?: string },
  ): Promise<void> {
    if (links.caseId && !(await this.repository.caseExists(workspaceId, links.caseId))) {
      throw new AppError(400, 'Linked case was not found in this workspace.');
    }

    if (
      links.clientId &&
      !(await this.repository.clientExists(workspaceId, links.clientId))
    ) {
      throw new AppError(400, 'Linked client was not found in this workspace.');
    }
  }
}

function buildFacets(
  data: Awaited<ReturnType<DocumentRepository['facets']>>,
): DocumentFacetsDto {
  const caseNames = new Map(
    data.caseRows.map((row) => [
      row.id,
      row.caseNumber ? `${row.caseNumber} — ${row.title}` : row.title,
    ]),
  );
  const clientNames = new Map(data.clientRows.map((row) => [row.id, row.name]));

  return {
    categories: data.categories.map((row) => ({
      id: row.category,
      label: categoryLabel(row.category),
      count: row._count._all,
    })),
    cases: data.cases
      .filter((row) => row.caseId)
      .map((row) => ({
        id: row.caseId as string,
        label: caseNames.get(row.caseId as string) ?? 'Unknown case',
        count: row._count._all,
      })),
    clients: data.clients
      .filter((row) => row.clientId)
      .map((row) => ({
        id: row.clientId as string,
        label: clientNames.get(row.clientId as string) ?? 'Unknown client',
        count: row._count._all,
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
