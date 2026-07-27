import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../shared/middleware/authenticate';
import { validateBody } from '../../../shared/middleware/validate';
import { createClientSchema, updateClientSchema } from '../dto/client.dto';
import { ClientRepository } from '../repositories/client.repository';
import { ClientService } from '../services/client.service';
import { ClientController } from '../controllers/client.controller';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';

export function buildClientRouter(prisma: PrismaClient, activityEngine?: ActivityEngineService, cacheInvalidator?: CacheInvalidator): Router {
  const router = Router();
  const repository = new ClientRepository(prisma);
  const service = new ClientService(repository, activityEngine, cacheInvalidator);
  const controller = new ClientController(service);

  router.use(authenticate);

  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.post('/', validateBody(createClientSchema), controller.create);
  router.patch('/:id', validateBody(updateClientSchema), controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
