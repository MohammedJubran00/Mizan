import cors from 'cors';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import { prisma } from './config/prisma';
import { buildAuthModule } from './modules/auth';
import { buildDashboardModule } from './modules/dashboard';
import { buildDocumentsModule } from './modules/documents';
import { buildClientRouter } from './modules/clients/routes/client.routes';
import { buildCaseRouter } from './modules/cases/routes/case.routes';
import { buildHearingRouter } from './modules/hearings/routes/hearing.routes';
import { buildDeadlineRouter } from './modules/deadlines/routes/deadline.routes';
import { buildBillingRouter } from './modules/billing/routes/billing.routes';
import { buildUsersRouter } from './modules/users/routes/users.routes';
import { buildActivitiesRouter } from './modules/activities/routes/activities.routes';
import { errorHandler } from './shared/errors/errorHandler';

export function createApp() {
  const app = express();

  // Trust proxy for correct compressed responses behind load balancers.
  app.set('trust proxy', 1);
  app.set('etag', false); // Dashboard sets strong ETags explicitly when needed.

  app.use(
    helmet({
      // PDFs are streamed to a browser client on a different origin.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
      // The web client reads the download filename and revalidates PDF streams.
      exposedHeaders: ['Content-Disposition', 'Content-Length', 'ETag'],
    }),
  );
  app.use(compression({ threshold: 1024 }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'OK' });
  });

  const { authRouter } = buildAuthModule();
  app.use('/api/auth', authRouter);

  const { dashboardRouter, activityEngine, cacheInvalidator } =
    buildDashboardModule();
  app.use('/api/dashboard', dashboardRouter);

  const { documentRouter } = buildDocumentsModule({
    activityEngine,
    cacheInvalidator,
  });
  app.use('/api/documents', documentRouter);

  app.use('/api/clients', buildClientRouter(prisma, activityEngine, cacheInvalidator));
  app.use('/api/cases', buildCaseRouter(prisma, activityEngine, cacheInvalidator));
  app.use('/api/hearings', buildHearingRouter(prisma, activityEngine, cacheInvalidator));
  app.use('/api/deadlines', buildDeadlineRouter(prisma, activityEngine, cacheInvalidator));
  app.use('/api/billing', buildBillingRouter(prisma, activityEngine, cacheInvalidator));
  app.use('/api/users', buildUsersRouter(prisma, activityEngine, cacheInvalidator));
  app.use('/api/activities', buildActivitiesRouter(prisma));

  app.use(errorHandler);

  return app;
}
