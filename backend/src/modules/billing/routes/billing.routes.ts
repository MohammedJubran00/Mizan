import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../shared/middleware/authenticate';
import { validateBody } from '../../../shared/middleware/validate';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  recordPaymentSchema,
  createManualRevenueSchema,
  createBillableHourSchema,
  updateBillableHourSchema,
} from '../dto/billing.dto';
import { BillingRepository } from '../repositories/billing.repository';
import { BillingModuleService } from '../services/billing.module.service';
import { BillingController } from '../controllers/billing.controller';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';

export function buildBillingRouter(prisma: PrismaClient, activityEngine?: ActivityEngineService, cacheInvalidator?: CacheInvalidator): Router {
  const router = Router();
  const repository = new BillingRepository(prisma);
  const service = new BillingModuleService(repository, activityEngine, cacheInvalidator);
  const controller = new BillingController(service);

  router.use(authenticate);

  // Invoices
  router.get('/invoices', controller.listInvoices);
  router.get('/invoices/summary', controller.summary);
  router.get('/invoices/:id', controller.getInvoiceById);
  router.post('/invoices', validateBody(createInvoiceSchema), controller.createInvoice);
  router.patch('/invoices/:id', validateBody(updateInvoiceSchema), controller.updateInvoice);
  router.post('/invoices/:id/void', controller.voidInvoice);
  router.post('/invoices/:id/send', controller.markSent);
  router.post('/invoices/:id/mark-paid', controller.markPaid);
  router.delete('/invoices/:id', controller.deleteInvoice);

  // Payments
  router.get('/payments', controller.listPayments);
  router.post('/payments', validateBody(recordPaymentSchema), controller.recordPayment);

  // Manual revenue
  router.get('/manual-revenue', controller.listManualRevenues);
  router.post('/manual-revenue', validateBody(createManualRevenueSchema), controller.createManualRevenue);

  // Billable hours
  router.get('/billable-hours', controller.listBillableHours);
  router.post('/billable-hours', validateBody(createBillableHourSchema), controller.createBillableHour);
  router.patch('/billable-hours/:id', validateBody(updateBillableHourSchema), controller.updateBillableHour);
  router.delete('/billable-hours/:id', controller.deleteBillableHour);

  return router;
}
