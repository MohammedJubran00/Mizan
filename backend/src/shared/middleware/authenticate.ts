import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { WorkspaceRole } from '@prisma/client';

import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { AppError } from '../errors/AppError';
import { normalizeTimezone } from '../utils/timezone';

interface JwtPayload {
  sub: string;
  email: string;
  workspaceId?: string;
}

/**
 * Verifies Bearer JWT and resolves an authenticated workspace context.
 * Workspace isolation: optional `X-Workspace-Id` must be a membership of the user.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required.');
    }

    const token = header.slice('Bearer '.length).trim();

    if (!token) {
      throw new AppError(401, 'Authentication required.');
    }

    let payload: JwtPayload;

    try {
      payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    } catch {
      throw new AppError(401, 'Invalid or expired access token.');
    }

    if (!payload.sub || !payload.email) {
      throw new AppError(401, 'Invalid access token payload.');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, fullName: true },
    });

    if (!user) {
      throw new AppError(401, 'User no longer exists.');
    }

    const requestedWorkspaceId =
      (typeof req.headers['x-workspace-id'] === 'string'
        ? req.headers['x-workspace-id'].trim()
        : undefined) || payload.workspaceId;

    const membership = await resolveMembership(user.id, requestedWorkspaceId);

    if (!membership) {
      throw new AppError(403, 'No workspace access available for this account.');
    }

    req.auth = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      workspaceId: membership.workspaceId,
      workspaceRole: membership.role,
      workspaceTimezone: membership.timezone,
    };

    next();
  } catch (error) {
    next(error);
  }
}

async function resolveMembership(
  userId: string,
  workspaceId?: string,
): Promise<{ workspaceId: string; role: WorkspaceRole; timezone: string } | null> {
  if (workspaceId) {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
      select: {
        workspaceId: true,
        role: true,
        workspace: { select: { timezone: true } },
      },
    });

    if (!membership) {
      return null;
    }

    return {
      workspaceId: membership.workspaceId,
      role: membership.role,
      timezone: normalizeTimezone(membership.workspace.timezone),
    };
  }

  const fallback = await prisma.workspaceMember.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: {
      workspaceId: true,
      role: true,
      workspace: { select: { timezone: true } },
    },
  });

  if (!fallback) {
    return null;
  }

  return {
    workspaceId: fallback.workspaceId,
    role: fallback.role,
    timezone: normalizeTimezone(fallback.workspace.timezone),
  };
}
