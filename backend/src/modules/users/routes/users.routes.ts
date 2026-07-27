import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../shared/middleware/authenticate';
import { validateBody } from '../../../shared/middleware/validate';
import { inviteMemberSchema, updateMemberSchema } from '../dto/users.dto';
import { UsersRepository } from '../repositories/users.repository';
import { UsersService } from '../services/users.service';
import { UsersController } from '../controllers/users.controller';
import { requireRoles } from '../../../shared/middleware/requireRoles';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';

export function buildUsersRouter(prisma: PrismaClient, activityEngine?: ActivityEngineService, cacheInvalidator?: CacheInvalidator): Router {
  const router = Router();
  const repository = new UsersRepository(prisma);
  const service = new UsersService(repository, activityEngine, cacheInvalidator);
  const controller = new UsersController(service);

  router.use(authenticate);

  router.get('/', controller.list);
  router.get('/roles', controller.roles);
  router.get('/:id', controller.getById);
  router.post('/', requireRoles('OWNER', 'ADMIN'), validateBody(inviteMemberSchema), controller.invite);
  router.patch('/:id', validateBody(updateMemberSchema), controller.update);
  router.delete('/:id', requireRoles('OWNER', 'ADMIN'), controller.remove);

  return router;
}
