import { Router } from 'express';

import { authenticate } from '../../../shared/middleware/authenticate';
import type { DashboardController } from '../controllers/dashboard.controller';

export function createDashboardRouter(controller: DashboardController): Router {
  const router = Router();

  router.get('/', authenticate, controller.getDashboard);

  return router;
}
