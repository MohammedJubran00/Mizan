import { AppError } from '../../../shared/errors/AppError';
import type { AuthContext } from '../../../shared/types/auth-context';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';
import type { CreateHearingInput, ListHearingsQuery, UpdateHearingInput } from '../dto/hearing.dto';
import type { HearingRepository, HearingRow } from '../repositories/hearing.repository';

function mapHearing(row: HearingRow) {
  return {
    id: row.id,
    title: row.title,
    hearingType: row.hearingType,
    scheduledAt: row.scheduledAt.toISOString(),
    status: row.status,
    room: row.room ?? null,
    location: row.location ?? null,
    courtName: row.courtName ?? null,
    judgeName: row.judgeName ?? null,
    notes: row.notes ?? null,
    durationMinutes: row.durationMinutes ?? null,
    outcome: row.outcome ?? null,
    nextAction: row.nextAction ?? null,
    reminderAt: row.reminderAt?.toISOString() ?? null,
    transcriptUrl: row.transcriptUrl ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    case: row.case
      ? { id: row.case.id, title: row.case.title, caseNumber: row.case.caseNumber ?? null, client: row.case.client ?? null }
      : null,
    caseId: row.caseId ?? null,
    assignedLawyer: row.assignedLawyer ?? null,
    assignedLawyerId: row.assignedLawyerId ?? null,
  };
}

export class HearingService {
  constructor(
    private readonly repository: HearingRepository,
    private readonly activityEngine?: ActivityEngineService,
    private readonly cacheInvalidator?: CacheInvalidator,
  ) {}

  async list(auth: AuthContext, query: ListHearingsQuery) {
    const { rows, total } = await this.repository.findMany(auth.workspaceId, query);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);
    return {
      success: true,
      items: rows.map(mapHearing),
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages, hasMore: query.page < totalPages },
    };
  }

  async calendar(auth: AuthContext, from: Date, to: Date) {
    const rows = await this.repository.findCalendarRange(auth.workspaceId, from, to);
    return rows.map(mapHearing);
  }

  async getById(auth: AuthContext, id: string) {
    const row = await this.repository.findById(auth.workspaceId, id);
    if (!row) throw new AppError(404, 'Hearing not found.');
    return mapHearing(row);
  }

  async create(auth: AuthContext, input: CreateHearingInput) {
    const row = await this.repository.create({
      workspace: { connect: { id: auth.workspaceId } },
      title: input.title,
      hearingType: input.hearingType ?? 'OTHER',
      scheduledAt: input.scheduledAt,
      status: input.status ?? 'SCHEDULED',
      room: input.room,
      location: input.location,
      courtName: input.courtName,
      judgeName: input.judgeName,
      notes: input.notes,
      durationMinutes: input.durationMinutes,
      outcome: input.outcome,
      nextAction: input.nextAction,
      reminderAt: input.reminderAt,
      case: input.caseId ? { connect: { id: input.caseId } } : undefined,
      assignedLawyer: input.assignedLawyerId ? { connect: { id: input.assignedLawyerId } } : undefined,
    });
    await this.activityEngine?.recordHearingScheduled({ workspaceId: auth.workspaceId, actorId: auth.user.id, hearingId: row.id, title: row.title });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'HEARING_SCHEDULED');
    return mapHearing(row);
  }

  async update(auth: AuthContext, id: string, input: UpdateHearingInput) {
    const existing = await this.repository.findById(auth.workspaceId, id);
    if (!existing) throw new AppError(404, 'Hearing not found.');

    const updateData: any = { ...input };
    if ('caseId' in input) {
      updateData.case = input.caseId ? { connect: { id: input.caseId } } : { disconnect: true };
      delete updateData.caseId;
    }
    if ('assignedLawyerId' in input) {
      updateData.assignedLawyer = input.assignedLawyerId ? { connect: { id: input.assignedLawyerId } } : { disconnect: true };
      delete updateData.assignedLawyerId;
    }

    const row = await this.repository.update(auth.workspaceId, id, updateData);
    if (!row) throw new AppError(404, 'Hearing not found.');
    await this.activityEngine?.recordHearingUpdated({ workspaceId: auth.workspaceId, actorId: auth.user.id, hearingId: id, title: row.title });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'HEARING_UPDATED');
    return mapHearing(row);
  }

  async reschedule(auth: AuthContext, id: string, scheduledAt: Date) {
    return this.update(auth, id, { scheduledAt, status: 'RESCHEDULED' });
  }

  async recordOutcome(auth: AuthContext, id: string, outcome: any, nextAction: any, notes: any) {
    return this.update(auth, id, { outcome, nextAction, notes, status: 'CONCLUDED' });
  }

  async delete(auth: AuthContext, id: string): Promise<void> {
    const deleted = await this.repository.delete(auth.workspaceId, id);
    if (!deleted) throw new AppError(404, 'Hearing not found.');
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'HEARING_UPDATED');
  }
}
