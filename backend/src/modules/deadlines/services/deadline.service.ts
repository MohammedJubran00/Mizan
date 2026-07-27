import { AppError } from '../../../shared/errors/AppError';
import type { AuthContext } from '../../../shared/types/auth-context';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';
import type { CreateDeadlineInput, ListDeadlinesQuery, UpdateDeadlineInput } from '../dto/deadline.dto';
import type { DeadlineRepository, DeadlineRow } from '../repositories/deadline.repository';

function mapDeadline(row: DeadlineRow) {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    importance: row.importance,
    dueAt: row.dueAt.toISOString(),
    status: row.status,
    note: row.note ?? null,
    caseId: row.caseId ?? null,
    case: row.case ? { id: row.case.id, title: row.case.title, caseNumber: row.case.caseNumber ?? null } : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class DeadlineService {
  constructor(
    private readonly repository: DeadlineRepository,
    private readonly activityEngine?: ActivityEngineService,
    private readonly cacheInvalidator?: CacheInvalidator,
  ) {}

  async list(auth: AuthContext, query: ListDeadlinesQuery) {
    const { rows, total } = await this.repository.findMany(auth.workspaceId, query);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);
    return {
      success: true,
      items: rows.map(mapDeadline),
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages, hasMore: query.page < totalPages },
    };
  }

  async getById(auth: AuthContext, id: string) {
    const row = await this.repository.findById(auth.workspaceId, id);
    if (!row) throw new AppError(404, 'Deadline not found.');
    return mapDeadline(row);
  }

  async create(auth: AuthContext, input: CreateDeadlineInput) {
    const row = await this.repository.create({
      workspace: { connect: { id: auth.workspaceId } },
      title: input.title,
      type: input.type ?? 'CASE',
      importance: input.importance ?? 'MEDIUM',
      dueAt: input.dueAt,
      status: input.status ?? 'PENDING',
      note: input.note,
      case: input.caseId ? { connect: { id: input.caseId } } : undefined,
    });
    await this.activityEngine?.recordDeadlineUpdated({ workspaceId: auth.workspaceId, actorId: auth.user.id, deadlineId: row.id, title: row.title });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'DEADLINE_ADDED');
    return mapDeadline(row);
  }

  async update(auth: AuthContext, id: string, input: UpdateDeadlineInput) {
    const existing = await this.repository.findById(auth.workspaceId, id);
    if (!existing) throw new AppError(404, 'Deadline not found.');

    const updateData: any = { ...input };
    if ('caseId' in input) {
      updateData.case = input.caseId ? { connect: { id: input.caseId } } : { disconnect: true };
      delete updateData.caseId;
    }
    const row = await this.repository.update(auth.workspaceId, id, updateData);
    if (!row) throw new AppError(404, 'Deadline not found.');
    await this.activityEngine?.recordDeadlineUpdated({ workspaceId: auth.workspaceId, actorId: auth.user.id, deadlineId: id, title: row.title });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'DEADLINE_UPDATED');
    return mapDeadline(row);
  }

  async delete(auth: AuthContext, id: string): Promise<void> {
    const deleted = await this.repository.delete(auth.workspaceId, id);
    if (!deleted) throw new AppError(404, 'Deadline not found.');
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'DEADLINE_UPDATED');
  }
}
