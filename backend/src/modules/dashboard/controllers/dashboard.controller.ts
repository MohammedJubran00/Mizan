import type { Request, Response } from 'express';

import { AppError } from '../../../shared/errors/AppError';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { parseRevenueFilters } from '../revenue/filters/revenue-filter';
import { parseTimelineFilters } from '../timeline/filters/timeline-filter';
import type { DashboardService } from '../services/dashboard.service';

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
    res.status(200).json(dashboard);
  });
}
