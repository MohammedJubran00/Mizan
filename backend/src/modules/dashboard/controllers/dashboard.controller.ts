import type { Request, Response } from 'express';
import { createHash } from 'crypto';

import { AppError } from '../../../shared/errors/AppError';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { parseRevenueFilters } from '../revenue/filters/revenue-filter';
import { parseTimelineFilters } from '../timeline/filters/timeline-filter';
import type { DashboardService } from '../services/dashboard.service';

/** Private short-lived cache hint — Smart Cache is the primary store. */
const CACHE_CONTROL = 'private, max-age=15, stale-while-revalidate=30';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) {
      throw new AppError(401, 'Authentication required.');
    }

    const query = req.query as Record<string, unknown>;
    const revenueFilter = parseRevenueFilters(query);
    const timelineFilter = parseTimelineFilters(query);
    const dashboard = await this.dashboardService.getDashboard(
      req.auth,
      revenueFilter,
      timelineFilter,
    );

    const body = JSON.stringify(dashboard);
    const etag = `"${createHash('sha1').update(body).digest('hex').slice(0, 20)}"`;

    res.setHeader('Cache-Control', CACHE_CONTROL);
    res.setHeader('ETag', etag);
    res.setHeader('Vary', 'Authorization, X-Workspace-Id');

    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch === etag) {
      res.status(304).end();
      return;
    }

    res.status(200).type('application/json').send(body);
  });
}
