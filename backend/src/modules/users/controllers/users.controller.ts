import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { routeParam } from '../../../shared/utils/routeParam';
import type { UsersService } from '../services/users.service';
import { listMembersSchema } from '../dto/users.dto';

export class UsersController {
  constructor(private readonly service: UsersService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const query = listMembersSchema.parse({ ...req.query });
    res.json(await this.service.list(auth, query));
  });

  roles = asyncHandler(async (_req: Request, res: Response) => {
    res.json(this.service.roles());
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.json({ success: true, data: await this.service.getById(auth, routeParam(req.params, 'id')) });
  });

  invite = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.status(201).json({ success: true, data: await this.service.invite(auth, req.body) });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.json({ success: true, data: await this.service.update(auth, routeParam(req.params, 'id'), req.body) });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    await this.service.remove(auth, routeParam(req.params, 'id'));
    res.status(204).send();
  });
}
