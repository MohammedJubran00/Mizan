import { prisma } from '../../config/prisma';
import { AuthController } from './controllers/auth.controller';
import { UserRepository } from './repositories/user.repository';
import { WorkspaceRepository } from './repositories/workspace.repository';
import { createAuthRouter } from './routes/auth.routes';
import { AuthService } from './services/auth.service';

export function buildAuthModule() {
  const userRepository = new UserRepository(prisma);
  const workspaceRepository = new WorkspaceRepository(prisma);
  const authService = new AuthService(userRepository, workspaceRepository);
  const authController = new AuthController(authService);
  const authRouter = createAuthRouter(authController);

  return { authRouter };
}
