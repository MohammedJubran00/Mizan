import { z } from 'zod';

const HearingTypeEnum = z.enum(['INITIAL_SCHEDULING', 'PRELIMINARY', 'TRIAL', 'MOTION', 'SETTLEMENT_MEDIATION', 'DEPOSITION', 'SENTENCING', 'MEDIATION', 'ARBITRATION', 'STATUS_CONFERENCE', 'OTHER']);
const HearingStatusEnum = z.enum(['UPCOMING', 'SCHEDULED', 'CONCLUDED', 'COMPLETED', 'CANCELLED', 'ADJOURNED', 'RESCHEDULED']);
const HearingOutcomeEnum = z.enum(['WON', 'SETTLED', 'LOST']);
const HearingNextActionEnum = z.enum(['FILE_MOTION', 'DRAFT_ORDER', 'NOTIFY_CLIENT', 'PREPARE_BRIEF', 'SCHEDULE_FOLLOW_UP', 'OTHER']);

export const createHearingSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(300),
  caseId: z.string().uuid().optional().nullable(),
  hearingType: HearingTypeEnum.default('OTHER'),
  scheduledAt: z.string().transform((v) => new Date(v)),
  status: HearingStatusEnum.default('SCHEDULED'),
  room: z.string().trim().max(100).optional().nullable(),
  location: z.string().trim().max(300).optional().nullable(),
  courtName: z.string().trim().max(200).optional().nullable(),
  judgeName: z.string().trim().max(200).optional().nullable(),
  assignedLawyerId: z.string().uuid().optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
  durationMinutes: z.number().int().min(1).max(1440).optional().nullable(),
  outcome: HearingOutcomeEnum.optional().nullable(),
  nextAction: HearingNextActionEnum.optional().nullable(),
  reminderAt: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
});

export const updateHearingSchema = createHearingSchema.partial();

export const rescheduleHearingSchema = z.object({
  scheduledAt: z.string().transform((v) => new Date(v)),
  reason: z.string().trim().max(500).optional(),
});

export const recordOutcomeSchema = z.object({
  outcome: HearingOutcomeEnum,
  nextAction: HearingNextActionEnum.optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
});

export const listHearingsSchema = z.object({
  search: z.string().trim().optional(),
  caseId: z.string().uuid().optional(),
  status: z.string().optional(),
  hearingType: z.string().optional(),
  from: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  to: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['scheduledAt', 'createdAt', 'title']).default('scheduledAt'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateHearingInput = z.infer<typeof createHearingSchema>;
export type UpdateHearingInput = z.infer<typeof updateHearingSchema>;
export type ListHearingsQuery = z.infer<typeof listHearingsSchema>;
