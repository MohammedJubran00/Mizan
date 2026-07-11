import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

async function bootstrap(): Promise<void> {
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Mizan API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch(async (error) => {
  console.error('Failed to start server:', error);
  await prisma.$disconnect();
  process.exit(1);
});
