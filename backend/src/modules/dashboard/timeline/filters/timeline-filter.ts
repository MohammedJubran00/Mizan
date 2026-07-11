import { z } from 'zod';

const optionalString = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.string().trim().min(1).optional(),
);

const optionalUuid = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.string().uuid().optional(),
);

export const timelineFilterSchema = z.object({
  hearingRange: z
    .enum(['TODAY', 'TOMORROW', 'THIS_WEEK', 'NEXT_WEEK', 'NEXT_30_DAYS', 'CUSTOM'])
    .optional()
    .default('NEXT_30_DAYS'),
  hearingFrom: z.coerce.date().optional(),
  hearingTo: z.coerce.date().optional(),
  hearingPage: z.coerce.number().int().min(1).optional().default(1),
  hearingPageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
  hearingCursor: optionalString,

  deadlinePage: z.coerce.number().int().min(1).optional().default(1),
  deadlinePageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
  deadlineCursor: optionalString,
  deadlineType: z
    .enum(['CASE', 'COURT', 'EVIDENCE', 'APPEAL', 'DOCUMENT', 'CONTRACT', 'INTERNAL', 'OTHER'])
    .optional(),

  activityPage: z.coerce.number().int().min(1).optional().default(1),
  activityPageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
  activityCursor: optionalString,
  activityType: optionalString,
  activityActorId: optionalUuid,
  activitySearch: optionalString,
  activityFrom: z.coerce.date().optional(),
  activityTo: z.coerce.date().optional(),
});

export type TimelineFilterInput = z.infer<typeof timelineFilterSchema>;

export function parseTimelineFilters(
  query: Record<string, unknown>,
): TimelineFilterInput {
  const result = timelineFilterSchema.safeParse({
    hearingRange: query.hearingRange ?? query.range,
    hearingFrom: query.hearingFrom,
    hearingTo: query.hearingTo,
    hearingPage: query.hearingPage ?? query.page,
    hearingPageSize: query.hearingPageSize ?? query.pageSize,
    hearingCursor: query.hearingCursor,
    deadlinePage: query.deadlinePage,
    deadlinePageSize: query.deadlinePageSize,
    deadlineCursor: query.deadlineCursor,
    deadlineType: query.deadlineType,
    activityPage: query.activityPage,
    activityPageSize: query.activityPageSize,
    activityCursor: query.activityCursor,
    activityType: query.activityType ?? query.type,
    activityActorId: query.activityActorId ?? query.actorId,
    activitySearch: query.activitySearch ?? query.search,
    activityFrom: query.activityFrom,
    activityTo: query.activityTo,
  });

  if (!result.success) {
    return timelineFilterSchema.parse({});
  }

  return result.data;
}
