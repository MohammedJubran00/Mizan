import { z } from 'zod';

const CaseStatusEnum = z.enum(['DRAFT', 'PENDING', 'OPEN', 'IN_PROGRESS', 'ON_HOLD', 'ACTIVE', 'CLOSED', 'WON', 'LOST', 'DISMISSED', 'ARCHIVED']);
const CasePriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const createCaseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(300),
  clientId: z.string().uuid().optional().nullable(),
  assignedToUserId: z.string().uuid().optional().nullable(),
  caseNumber: z.string().trim().max(100).optional().nullable(),
  status: CaseStatusEnum.default('OPEN'),
  priority: CasePriorityEnum.default('MEDIUM'),
  practiceArea: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().max(10000).optional().nullable(),
  court: z.string().trim().max(200).optional().nullable(),
  judgeName: z.string().trim().max(200).optional().nullable(),
  opposingParty: z.string().trim().max(200).optional().nullable(),
  opposingCounsel: z.string().trim().max(200).optional().nullable(),
  jurisdiction: z.string().trim().max(200).optional().nullable(),
  filingDate: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  filingDeadline: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  discoveryDeadline: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  expectedClosingAt: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  memberUserIds: z.array(z.string().uuid()).optional(),
});

export const updateCaseSchema = createCaseSchema.partial();

export const updateCaseStatusSchema = z.object({
  status: CaseStatusEnum,
});

export const createCaseNoteSchema = z.object({
  title: z.string().trim().max(200).optional().nullable(),
  body: z.string().trim().min(1, 'Description is required.').max(10000),
  shared: z.boolean().optional(),
});

export const listCasesSchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  clientId: z.string().uuid().optional(),
  assignedToUserId: z.string().uuid().optional(),
  practiceArea: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['createdAt', 'title', 'status', 'openedAt', 'caseNumber', 'nextHearingAt', 'priority'])
    .default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type CreateCaseNoteInput = z.infer<typeof createCaseNoteSchema>;
export type ListCasesQuery = z.infer<typeof listCasesSchema>;
