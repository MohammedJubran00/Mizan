import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { routeParam } from '../../../shared/utils/routeParam';
import type { HearingService } from '../services/hearing.service';
import { listHearingsSchema, rescheduleHearingSchema, recordOutcomeSchema } from '../dto/hearing.dto';
import { z } from 'zod';

export class HearingController {
  constructor(private readonly service: HearingService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const query = listHearingsSchema.parse({ ...req.query });
    const result = await this.service.list(auth, query);
    res.json(result);
  });

  calendar = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const { from, to } = z.object({
      from: z.string().transform((v) => new Date(v)),
      to: z.string().transform((v) => new Date(v)),
    }).parse(req.query);
    const items = await this.service.calendar(auth, from, to);
    res.json({ success: true, items });
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

  reschedule = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const { scheduledAt } = rescheduleHearingSchema.parse(req.body);
    const data = await this.service.reschedule(auth, routeParam(req.params, 'id'), scheduledAt);
    res.json({ success: true, data });
  });

  recordOutcome = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const { outcome, nextAction, notes } = recordOutcomeSchema.parse(req.body);
    const data = await this.service.recordOutcome(auth, routeParam(req.params, 'id'), outcome, nextAction, notes);
    res.json({ success: true, data });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    await this.service.delete(auth, routeParam(req.params, 'id'));
    res.status(204).send();
  });
}
