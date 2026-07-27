import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { routeParam } from '../../../shared/utils/routeParam';
import type { CaseService } from '../services/case.service';
import { listCasesSchema, updateCaseStatusSchema } from '../dto/case.dto';
import { z } from 'zod';

export class CaseController {
  constructor(private readonly service: CaseService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const query = listCasesSchema.parse({ ...req.query });
    const result = await this.service.list(auth, query);
    res.json(result);
  });

  stats = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const result = await this.service.stats(auth);
    res.json({ success: true, data: result });
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

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const { status } = updateCaseStatusSchema.parse(req.body);
    const data = await this.service.update(auth, routeParam(req.params, 'id'), { status });
    res.json({ success: true, data });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    await this.service.delete(auth, routeParam(req.params, 'id'));
    res.status(204).send();
  });

  bulkDelete = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const { ids } = z.object({ ids: z.array(z.string().uuid()).min(1) }).parse(req.body);
    const count = await this.service.bulkDelete(auth, ids);
    res.json({ success: true, deleted: count });
  });
}
