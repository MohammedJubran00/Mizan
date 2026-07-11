import type { Request, Response } from 'express';

import { AppError } from '../../../shared/errors/AppError';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import type { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) {
      throw new AppError(401, 'Authentication required.');
    }

    const dashboard = await this.dashboardService.getDashboard(req.auth);
    res.status(200).json(dashboard);
  });
}
