import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../shared/middleware/authenticate';
import { validateBody } from '../../../shared/middleware/validate';
import { createHearingSchema, updateHearingSchema } from '../dto/hearing.dto';
import { HearingRepository } from '../repositories/hearing.repository';
import { HearingService } from '../services/hearing.service';
import { HearingController } from '../controllers/hearing.controller';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';

export function buildHearingRouter(prisma: PrismaClient, activityEngine?: ActivityEngineService, cacheInvalidator?: CacheInvalidator): Router {
  const router = Router();
  const repository = new HearingRepository(prisma);
  const service = new HearingService(repository, activityEngine, cacheInvalidator);
  const controller = new HearingController(service);

  router.use(authenticate);

  router.get('/', controller.list);
  router.get('/calendar', controller.calendar);
  router.get('/:id', controller.getById);
  router.post('/', validateBody(createHearingSchema), controller.create);
  router.patch('/:id', validateBody(updateHearingSchema), controller.update);
  router.post('/:id/reschedule', controller.reschedule);
  router.patch('/:id/outcome', controller.recordOutcome);
  router.delete('/:id', controller.delete);

  return router;
}
