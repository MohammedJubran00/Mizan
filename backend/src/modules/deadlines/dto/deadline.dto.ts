import { z } from 'zod';

const DeadlineTypeEnum = z.enum(['CASE', 'COURT', 'EVIDENCE', 'APPEAL', 'DOCUMENT', 'CONTRACT', 'INTERNAL', 'OTHER']);
const DeadlineStatusEnum = z.enum(['PENDING', 'UPCOMING', 'COMPLETED', 'OVERDUE', 'CANCELLED']);
const DeadlineImportanceEnum = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);

export const createDeadlineSchema = z.object({
  title: z.string().trim().min(1).max(300),
  caseId: z.string().uuid().optional().nullable(),
  type: DeadlineTypeEnum.default('CASE'),
  importance: DeadlineImportanceEnum.default('MEDIUM'),
  dueAt: z.string().transform((v) => new Date(v)),
  status: DeadlineStatusEnum.default('PENDING'),
  note: z.string().trim().max(5000).optional().nullable(),
});

export const updateDeadlineSchema = createDeadlineSchema.partial();

export const listDeadlinesSchema = z.object({
  caseId: z.string().uuid().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  importance: z.string().optional(),
  from: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  to: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['dueAt', 'createdAt', 'title']).default('dueAt'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateDeadlineInput = z.infer<typeof createDeadlineSchema>;
export type UpdateDeadlineInput = z.infer<typeof updateDeadlineSchema>;
export type ListDeadlinesQuery = z.infer<typeof listDeadlinesSchema>;
