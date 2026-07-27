import type { PrismaClient } from '@prisma/client';
import { AppError } from '../../../shared/errors/AppError';
import type { AuthContext } from '../../../shared/types/auth-context';
import type { ActivityEngineService } from '../../dashboard/statistics/activity-engine.service';
import type { CacheInvalidator } from '../../../shared/cache/cache-invalidator';
import type { CreateCaseInput, ListCasesQuery, UpdateCaseInput } from '../dto/case.dto';
import type { CaseRepository } from '../repositories/case.repository';
import type { CaseRow } from '../repositories/case.repository';

function importanceToPriority(importance: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
  switch (importance) {
    case 'CRITICAL':
      return 'URGENT';
    case 'HIGH':
      return 'HIGH';
    case 'LOW':
      return 'LOW';
    default:
      return 'MEDIUM';
  }
}

function mapPerson(
  person: { id: string; fullName?: string | null; name?: string | null; email?: string | null; phone?: string | null; avatarUrl?: string | null; companyName?: string | null } | null,
) {
  if (!person) return null;
  return {
    id: person.id,
    fullName: person.fullName ?? person.name ?? '',
    email: person.email ?? null,
    phone: person.phone ?? null,
    subtitle: person.companyName ?? null,
    avatarUrl: person.avatarUrl ?? null,
  };
}

function mapBilling(row: CaseRow) {
  const invoices = (row.invoices ?? []).map((inv) => ({
    id: inv.id,
    number: inv.number,
    amount: Number(inv.amount),
    currency: inv.currency,
    status: inv.status,
    issuedAt: inv.issuedAt.toISOString(),
    dueAt: inv.dueAt?.toISOString() ?? null,
  }));

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = (row.invoices ?? [])
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);
  const currency = invoices[0]?.currency ?? 'USD';

  return {
    totalBilled,
    payments: {
      totalPaid,
      outstanding: Math.max(0, totalBilled - totalPaid),
      currency,
    },
    invoices,
  };
}

function mapCase(row: CaseRow) {
  const nextHearing = row.hearings.find((h) => new Date(h.scheduledAt).getTime() >= Date.now())
    ?? row.hearings[0]
    ?? null;

  const leadLawyer = mapPerson(row.assignedTo);
  const client = mapPerson(row.client);

  return {
    id: row.id,
    title: row.title,
    caseNumber: row.caseNumber ?? row.id.slice(0, 8).toUpperCase(),
    status: row.status,
    priority: row.priority,
    practiceArea: row.practiceArea ?? 'OTHER',
    description: row.description ?? null,
    court: row.court ?? null,
    judgeName: row.judgeName ?? null,
    opposingParty: row.opposingParty ?? null,
    opposingCounsel: row.opposingCounsel ?? null,
    jurisdiction: row.jurisdiction ?? null,
    billableHours: Number(row.billableHours),
    openedAt: row.openedAt.toISOString(),
    closedAt: row.closedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),

    // List + details shared fields
    client,
    leadLawyer,
    isLeadAssigned: Boolean(leadLawyer),
    nextHearingAt: nextHearing?.scheduledAt.toISOString() ?? null,
    assignedTo: leadLawyer,
    members: row.members.map((m) => mapPerson(m.user)!),
    team: row.members.map((m) => mapPerson(m.user)!),

    counters: {
      hearings: row.hearings.length,
      documents: row.documents.length,
      notes: 0,
    },
    billing: mapBilling(row),
    milestones: {
      filingDate: row.filingDate?.toISOString() ?? null,
      nextHearingAt: nextHearing?.scheduledAt.toISOString() ?? null,
      filingDeadline: row.filingDeadline?.toISOString() ?? null,
      discoveryDeadline: row.discoveryDeadline?.toISOString() ?? null,
      expectedClosingAt: row.expectedClosingAt?.toISOString() ?? null,
    },
    deadlines: row.deadlines.map((d) => ({
      id: d.id,
      label: d.title,
      dueAt: d.dueAt.toISOString(),
      status: d.status,
      priority: importanceToPriority(d.importance),
      note: null,
    })),
    timeline: [],
    hearings: row.hearings.map((h) => ({
      id: h.id,
      caseId: row.id,
      caseNumber: row.caseNumber ?? null,
      type: h.hearingType,
      status: h.status,
      scheduledAt: h.scheduledAt.toISOString(),
      court: h.courtName ?? null,
      room: h.location ?? null,
      judgeName: null,
      notes: null,
      transcriptUrl: null,
      createdAt: h.createdAt.toISOString(),
      title: h.title,
      hearingType: h.hearingType,
      courtName: h.courtName ?? null,
    })),
    documents: row.documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      fileName: doc.fileName,
      category: doc.category,
      sizeBytes: doc.sizeBytes,
      mimeType: doc.mimeType,
      createdAt: doc.createdAt.toISOString(),
    })),
    notes: [],
  };
}

export class CaseService {
  constructor(
    private readonly repository: CaseRepository,
    private readonly prisma: PrismaClient,
    private readonly activityEngine?: ActivityEngineService,
    private readonly cacheInvalidator?: CacheInvalidator,
  ) {}

  async list(auth: AuthContext, query: ListCasesQuery) {
    const { rows, total } = await this.repository.findMany(auth.workspaceId, query);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);
    return {
      success: true,
      items: rows.map(mapCase),
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages, hasMore: query.page < totalPages },
    };
  }

  async getById(auth: AuthContext, id: string) {
    const row = await this.repository.findById(auth.workspaceId, id);
    if (!row) throw new AppError(404, 'Case not found.');
    return mapCase(row);
  }

  async stats(auth: AuthContext) {
    return this.repository.stats(auth.workspaceId);
  }

  async create(auth: AuthContext, input: CreateCaseInput) {
    const { memberUserIds, ...rest } = input;
    const row = await this.repository.create({
      workspace: { connect: { id: auth.workspaceId } },
      title: rest.title,
      caseNumber: rest.caseNumber,
      status: rest.status ?? 'OPEN',
      priority: rest.priority ?? 'MEDIUM',
      practiceArea: rest.practiceArea,
      description: rest.description,
      court: rest.court,
      judgeName: rest.judgeName,
      opposingParty: rest.opposingParty,
      opposingCounsel: rest.opposingCounsel,
      jurisdiction: rest.jurisdiction,
      filingDate: rest.filingDate,
      filingDeadline: rest.filingDeadline,
      discoveryDeadline: rest.discoveryDeadline,
      expectedClosingAt: rest.expectedClosingAt,
      client: rest.clientId ? { connect: { id: rest.clientId } } : undefined,
      assignedTo: rest.assignedToUserId ? { connect: { id: rest.assignedToUserId } } : undefined,
    });

    if (memberUserIds?.length) {
      await this.repository.syncMembers(auth.workspaceId, row.id, memberUserIds);
    }

    await this.activityEngine?.recordCaseCreated({ workspaceId: auth.workspaceId, actorId: auth.user.id, caseId: row.id, title: row.title });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'CASE_CREATED');

    const updated = await this.repository.findById(auth.workspaceId, row.id);
    return mapCase(updated ?? row);
  }

  async update(auth: AuthContext, id: string, input: UpdateCaseInput) {
    const existing = await this.repository.findById(auth.workspaceId, id);
    if (!existing) throw new AppError(404, 'Case not found.');

    const { memberUserIds, ...rest } = input;

    const updateData: any = { ...rest };
    if (rest.clientId !== undefined) {
      updateData.client = rest.clientId ? { connect: { id: rest.clientId } } : { disconnect: true };
      delete updateData.clientId;
    }
    if (rest.assignedToUserId !== undefined) {
      updateData.assignedTo = rest.assignedToUserId ? { connect: { id: rest.assignedToUserId } } : { disconnect: true };
      delete updateData.assignedToUserId;
    }

    if (rest.status === 'CLOSED' || rest.status === 'WON' || rest.status === 'LOST') {
      updateData.closedAt = new Date();
    }

    const row = await this.repository.update(auth.workspaceId, id, updateData);
    if (!row) throw new AppError(404, 'Case not found.');

    if (memberUserIds !== undefined) {
      await this.repository.syncMembers(auth.workspaceId, id, memberUserIds);
    }

    await this.activityEngine?.recordCaseUpdated({ workspaceId: auth.workspaceId, actorId: auth.user.id, caseId: id, title: row.title });
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'CASE_UPDATED');

    const refreshed = await this.repository.findById(auth.workspaceId, id);
    return mapCase(refreshed ?? row);
  }

  async delete(auth: AuthContext, id: string): Promise<void> {
    const deleted = await this.repository.delete(auth.workspaceId, id);
    if (!deleted) throw new AppError(404, 'Case not found.');
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'CASE_UPDATED');
  }

  async bulkDelete(auth: AuthContext, ids: string[]): Promise<number> {
    const count = await this.repository.bulkDelete(auth.workspaceId, ids);
    await this.cacheInvalidator?.invalidateForMutation(auth.workspaceId, 'CASE_UPDATED');
    return count;
  }
}
