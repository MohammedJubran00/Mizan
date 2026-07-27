import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../shared/middleware/authenticate';
import { validateBody } from '../../../shared/middleware/validate';
import { createDeadlineSchema, updateDeadlineSchema } from '../dto/deadline.dto';
import { DeadlineRepository } from '../repositories/deadline.repository';
import { DeadlineService } from '../services/deadline.service';
import { DeadlineController } from '../controllers/deadline.controller';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';

export function buildDeadlineRouter(prisma: PrismaClient, activityEngine?: ActivityEngineService, cacheInvalidator?: CacheInvalidator): Router {
  const router = Router();
  const repository = new DeadlineRepository(prisma);
  const service = new DeadlineService(repository, activityEngine, cacheInvalidator);
  const controller = new DeadlineController(service);

  router.use(authenticate);

  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.post('/', validateBody(createDeadlineSchema), controller.create);
  router.patch('/:id', validateBody(updateDeadlineSchema), controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
