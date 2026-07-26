import cors from 'cors';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import { buildAuthModule } from './modules/auth';
import { buildDashboardModule } from './modules/dashboard';
import { buildDocumentsModule } from './modules/documents';
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

  app.use(errorHandler);

  return app;
}
