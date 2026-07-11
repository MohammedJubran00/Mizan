import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

import { AppError } from './AppError';

interface ErrorBody {
  success: false;
  message: string;
  errors?: unknown;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ErrorBody = {
      success: false,
      message: err.message,
    };
    if (err.details !== undefined) {
      body.errors = err.details;
    }
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.') || undefined,
        message: issue.message,
      })),
    } satisfies ErrorBody);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      } satisfies ErrorBody);
      return;
    }
  }

  console.error('[UnhandledError]', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error.',
  } satisfies ErrorBody);
}
