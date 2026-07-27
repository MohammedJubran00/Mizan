import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../shared/middleware/authenticate';
import { validateBody } from '../../../shared/middleware/validate';
import { createCaseSchema, createCaseNoteSchema, updateCaseSchema } from '../dto/case.dto';
import { CaseRepository } from '../repositories/case.repository';
import { CaseService } from '../services/case.service';
import { CaseController } from '../controllers/case.controller';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';

export function buildCaseRouter(prisma: PrismaClient, activityEngine?: ActivityEngineService, cacheInvalidator?: CacheInvalidator): Router {
  const router = Router();
  const repository = new CaseRepository(prisma);
  const service = new CaseService(repository, prisma, activityEngine, cacheInvalidator);
  const controller = new CaseController(service);

  router.use(authenticate);

  router.get('/', controller.list);
  router.get('/stats', controller.stats);
  router.get('/:id', controller.getById);
  router.post('/', validateBody(createCaseSchema), controller.create);
  router.post('/:id/notes', validateBody(createCaseNoteSchema), controller.createNote);
  router.patch('/:id', validateBody(updateCaseSchema), controller.update);
  router.patch('/:id/status', controller.updateStatus);
  router.delete('/bulk', controller.bulkDelete);
  router.delete('/:id', controller.delete);

  return router;
}
