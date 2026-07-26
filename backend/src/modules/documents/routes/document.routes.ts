import { Router } from 'express';

import { authenticate } from '../../../shared/middleware/authenticate';
import type { DocumentController } from '../controllers/document.controller';

export function createDocumentRouter(
  controller: DocumentController,
  uploadMiddleware: ReturnType<
    typeof import('../middleware/upload').createPdfUploadMiddleware
  >,
): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', controller.list);
  router.post('/', uploadMiddleware, controller.upload);
  router.get('/:id', controller.getById);
  router.get('/:id/file', controller.streamFile);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
