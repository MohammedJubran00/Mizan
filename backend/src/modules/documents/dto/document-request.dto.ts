import { z } from 'zod';

export const DOCUMENT_CATEGORIES = [
  'PLEADING',
  'CONTRACT',
  'EVIDENCE',
  'CORRESPONDENCE',
  'INVOICE',
  'REPORT',
  'OTHER',
] as const;

export const DOCUMENT_SORT_FIELDS = [
  'createdAt',
  'title',
  'sizeBytes',
  'category',
] as const;

const optionalTrimmed = z
  .string()
  .trim()
  .min(1)
  .optional()
  .or(z.literal('').transform(() => undefined));

export const listDocumentsSchema = z.object({
  search: optionalTrimmed,
  category: z.enum(DOCUMENT_CATEGORIES).optional(),
  caseId: optionalTrimmed,
  clientId: optionalTrimmed,
  sortBy: z.enum(DOCUMENT_SORT_FIELDS).default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type ListDocumentsQuery = z.infer<typeof listDocumentsSchema>;

/** Multipart text fields sent alongside the uploaded file. */
export const createDocumentSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  category: z.enum(DOCUMENT_CATEGORIES).default('OTHER'),
  caseId: optionalTrimmed,
  clientId: optionalTrimmed,
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const updateDocumentSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    category: z.enum(DOCUMENT_CATEGORIES).optional(),
    caseId: z.string().trim().min(1).nullable().optional(),
    clientId: z.string().trim().min(1).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'No fields to update.',
  });

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
