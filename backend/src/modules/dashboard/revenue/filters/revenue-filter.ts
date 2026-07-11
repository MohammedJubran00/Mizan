import { z } from 'zod';

const optionalString = z
  .string()
  .trim()
  .min(1)
  .optional()
  .or(z.literal('').transform(() => undefined));

/**
 * Extensible revenue filter contract.
 * New filters can be added here without changing repository signatures.
 */
export const revenueFilterSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  practiceArea: optionalString,
  lawyerId: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  caseType: optionalString,
  clientId: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  currency: z
    .string()
    .trim()
    .length(3)
    .transform((v) => v.toUpperCase())
    .optional()
    .or(z.literal('').transform(() => undefined)),
  source: z.enum(['INVOICE', 'MANUAL', 'PROVIDER']).optional(),
  category: z
    .enum([
      'INVOICE_PAYMENT',
      'MANUAL',
      'CONSULTATION',
      'COURT_FEE',
      'RETAINER',
      'SUBSCRIPTION',
      'OTHER',
    ])
    .optional(),
  status: z.enum(['POSTED', 'PENDING', 'CANCELLED', 'REFUNDED']).optional(),
  topLimit: z.coerce.number().int().min(1).max(50).optional().default(5),
});

export type RevenueFilterInput = z.infer<typeof revenueFilterSchema>;

export interface RevenueQueryFilter extends RevenueFilterInput {
  workspaceId: string;
}

export function parseRevenueFilters(
  query: Record<string, unknown>,
): RevenueFilterInput {
  const result = revenueFilterSchema.safeParse({
    dateFrom: query.dateFrom ?? query.from,
    dateTo: query.dateTo ?? query.to,
    practiceArea: query.practiceArea,
    lawyerId: query.lawyerId ?? query.lawyer,
    caseType: query.caseType,
    clientId: query.clientId ?? query.client,
    currency: query.currency,
    source: query.source ?? query.revenueSource,
    category: query.category,
    status: query.status,
    topLimit: query.topLimit ?? query.limit,
  });

  if (!result.success) {
    // Invalid filter values are ignored rather than failing the whole dashboard.
    return { topLimit: 5 };
  }

  return result.data;
}
