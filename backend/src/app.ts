import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import { buildAuthModule } from './modules/auth';
import { errorHandler } from './shared/errors/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'OK' });
  });

  const { authRouter } = buildAuthModule();
  app.use('/api/auth', authRouter);

  app.use(errorHandler);

  return app;
}
