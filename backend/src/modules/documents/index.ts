import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import type { CacheInvalidator } from '../../shared/cache/cache-invalidator';
import type { ActivityEngineService } from '../dashboard/statistics/activity-engine.service';
import { DocumentController } from './controllers/document.controller';
import { createPdfUploadMiddleware } from './middleware/upload';
import { DocumentRepository } from './repositories/document.repository';
import { createDocumentRouter } from './routes/document.routes';
import { DocumentService } from './services/document.service';
import { DocumentStorageService } from './storage/document-storage.service';

export interface DocumentsModuleDeps {
  activityEngine?: ActivityEngineService;
  cacheInvalidator?: CacheInvalidator;
}

export function buildDocumentsModule(deps: DocumentsModuleDeps = {}) {
  const documentRepository = new DocumentRepository(prisma);
  const documentStorage = new DocumentStorageService(env.uploadDir);
  const documentService = new DocumentService(
    documentRepository,
    documentStorage,
    deps.activityEngine,
    deps.cacheInvalidator,
  );
  const documentController = new DocumentController(documentService);
  const documentRouter = createDocumentRouter(
    documentController,
    createPdfUploadMiddleware(env.maxUploadMb),
  );

  return { documentRouter, documentService, documentStorage };
}
