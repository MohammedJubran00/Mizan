import type { NextFunction, Request, Response } from 'express';
import type { WorkspaceRole } from '@prisma/client';

import { AppError } from '../errors/AppError';

/**
 * Ensures the authenticated workspace role is in the allowed list.
 * Must be placed after `authenticate`.
 */
export function requireRoles(...allowed: WorkspaceRole[]) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    const role = (_req as any).auth?.workspaceRole as WorkspaceRole | undefined;
    if (!role || !allowed.includes(role)) {
      next(new AppError(403, 'You do not have permission to perform this action.'));
      return;
    }
    next();
  };
}
