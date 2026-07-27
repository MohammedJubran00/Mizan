import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate } from '../../../shared/middleware/authenticate';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export function buildActivitiesRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.use(authenticate);

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const auth = (req as any).auth;
      const { entityType, entityId, page, pageSize } = z.object({
        entityType: z.string().trim().optional(),
        entityId: z.string().trim().optional(),
        page: z.coerce.number().int().min(1).default(1),
        pageSize: z.coerce.number().int().min(1).max(100).default(20),
      }).parse({ ...req.query });

      const where: any = { workspaceId: auth.workspaceId };
      if (entityType) where.entityType = entityType;
      if (entityId) where.entityId = entityId;

      const [rows, total] = await Promise.all([
        prisma.activity.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        }),
        prisma.activity.count({ where }),
      ]);

      const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
      res.json({
        success: true,
        items: rows.map((r) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          description: r.description ?? null,
          entityType: r.entityType ?? null,
          entityId: r.entityId ?? null,
          targetName: r.targetName ?? null,
          severity: r.severity,
          icon: r.icon ?? null,
          color: r.color ?? null,
          metadata: r.metadata,
          createdAt: r.createdAt.toISOString(),
          user: r.user ? { id: r.user.id, fullName: r.user.fullName, avatarUrl: r.user.avatarUrl ?? null } : null,
        })),
        pagination: { page, pageSize, total, totalPages, hasMore: page < totalPages },
      });
    }),
  );

  return router;
}
