import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { routeParam } from '../../../shared/utils/routeParam';
import type { BillingModuleService } from '../services/billing.module.service';
import { listInvoicesSchema, listBillingSchema } from '../dto/billing.dto';
import { z } from 'zod';

export class BillingController {
  constructor(private readonly service: BillingModuleService) {}

  // ─── Invoices ───────────────────────────────────────────────────────────
  listInvoices = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const query = listInvoicesSchema.parse({ ...req.query });
    res.json(await this.service.listInvoices(auth, query));
  });

  getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.json({ success: true, data: await this.service.getInvoiceById(auth, routeParam(req.params, 'id')) });
  });

  createInvoice = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.status(201).json({ success: true, data: await this.service.createInvoice(auth, req.body) });
  });

  updateInvoice = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.json({ success: true, data: await this.service.updateInvoice(auth, routeParam(req.params, 'id'), req.body) });
  });

  voidInvoice = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.json({ success: true, data: await this.service.voidInvoice(auth, routeParam(req.params, 'id')) });
  });

  markSent = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.json({ success: true, data: await this.service.markSent(auth, routeParam(req.params, 'id')) });
  });

  markPaid = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.json({ success: true, data: await this.service.markPaid(auth, routeParam(req.params, 'id')) });
  });

  deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    await this.service.deleteInvoice(auth, routeParam(req.params, 'id'));
    res.status(204).send();
  });

  // ─── Payments ─────────────────────────────────────────────────────────────
  listPayments = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const query = listBillingSchema.parse({ ...req.query });
    res.json(await this.service.listPayments(auth, query));
  });

  recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.status(201).json({ success: true, data: await this.service.recordPayment(auth, req.body) });
  });

  // ─── Manual Revenue ────────────────────────────────────────────────────────
  listManualRevenues = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const query = listBillingSchema.parse({ ...req.query });
    res.json(await this.service.listManualRevenues(auth, query));
  });

  createManualRevenue = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.status(201).json({ success: true, data: await this.service.createManualRevenue(auth, req.body) });
  });

  // ─── Billable Hours ────────────────────────────────────────────────────────
  listBillableHours = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(20),
      caseId: z.string().uuid().optional(),
    }).parse({ ...req.query });
    res.json(await this.service.listBillableHours(auth, query));
  });

  createBillableHour = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.status(201).json({ success: true, data: await this.service.createBillableHour(auth, req.body) });
  });

  updateBillableHour = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.json({ success: true, data: await this.service.updateBillableHour(auth, routeParam(req.params, 'id'), req.body) });
  });

  deleteBillableHour = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    await this.service.deleteBillableHour(auth, routeParam(req.params, 'id'));
    res.status(204).send();
  });

  // ─── Summary ─────────────────────────────────────────────────────────────
  summary = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    res.json({ success: true, data: await this.service.summary(auth) });
  });
}
