import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { routeParam } from '../../../shared/utils/routeParam';
import type { ClientService } from '../services/client.service';
import { listClientsSchema } from '../dto/client.dto';

export class ClientController {
  constructor(private readonly service: ClientService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const query = listClientsSchema.parse({ ...req.query });
    const result = await this.service.list(auth, query);
    res.json(result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const client = await this.service.getById(auth, routeParam(req.params, 'id'));
    res.json({ success: true, data: client });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const client = await this.service.create(auth, req.body);
    res.status(201).json({ success: true, data: client });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const client = await this.service.update(auth, routeParam(req.params, 'id'), req.body);
    res.json({ success: true, data: client });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    await this.service.delete(auth, routeParam(req.params, 'id'));
    res.status(204).send();
  });
}
