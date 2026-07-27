import { z } from 'zod';

export const createClientSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.').max(100),
  lastName: z.string().trim().min(1, 'Last name is required.').max(100),
  companyName: z.string().trim().max(200).optional(),
  occupation: z.string().trim().max(200).optional(),
  nationalId: z.string().trim().max(100).optional(),
  dateOfBirth: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  email: z.string().trim().email('Invalid email.').optional().or(z.literal('')).transform((v) => v || undefined),
  phone: z.string().trim().max(50).optional(),
  addressCountry: z.string().trim().max(100).optional(),
  addressCity: z.string().trim().max(100).optional(),
  addressStreet: z.string().trim().max(200).optional(),
  addressPostalCode: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(5000).optional(),
  tags: z.array(z.string().trim().max(50)).default([]),
});

export const updateClientSchema = createClientSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

export const listClientsSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED', 'ALL']).default('ALL'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'name', 'updatedAt']).default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsSchema>;
