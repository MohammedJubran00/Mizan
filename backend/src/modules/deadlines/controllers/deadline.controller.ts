import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { routeParam } from '../../../shared/utils/routeParam';
import type { DeadlineService } from '../services/deadline.service';
import { listDeadlinesSchema } from '../dto/deadline.dto';

export class DeadlineController {
  constructor(private readonly service: DeadlineService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const query = listDeadlinesSchema.parse({ ...req.query });
    const result = await this.service.list(auth, query);
    res.json(result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const data = await this.service.getById(auth, routeParam(req.params, 'id'));
    res.json({ success: true, data });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const data = await this.service.create(auth, req.body);
    res.status(201).json({ success: true, data });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const data = await this.service.update(auth, routeParam(req.params, 'id'), req.body);
    res.json({ success: true, data });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    await this.service.delete(auth, routeParam(req.params, 'id'));
    res.status(204).send();
  });
}
