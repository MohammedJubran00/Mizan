import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { validateBody } from '../../../shared/middleware/validate';
import type { AuthController } from '../controllers/auth.controller';
import { loginSchema } from '../dto/login.dto';
import { registerSchema } from '../dto/register.dto';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  router.post(
    '/register',
    authLimiter,
    validateBody(registerSchema),
    controller.register,
  );

  router.post(
    '/login',
    authLimiter,
    validateBody(loginSchema),
    controller.login,
  );

  return router;
}
