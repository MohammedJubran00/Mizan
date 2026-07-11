import type { ActivityType } from '@prisma/client';

import type { ActivitiesDto, ActivityItemDto } from '../dto';
import type {
  DashboardActivityRepository,
  RecordActivityInput,
} from '../repositories/dashboard-activity.repository';

export interface ActivityEventInput {
  workspaceId: string;
  actorId?: string | null;
  type: ActivityType;
  title: string;
  description?: string | null;
  targetType?: string | null;
  targetId?: string | null;
}

/**
 * Reusable Activity / Audit engine.
 * Records workspace-scoped events and exposes recent-activity statistics.
 */
export class ActivityEngineService {
  constructor(private readonly activityRepository: DashboardActivityRepository) {}

  async record(input: ActivityEventInput): Promise<ActivityItemDto> {
    const created = await this.activityRepository.create(input as RecordActivityInput);
    return mapActivity(created);
  }

  async recordCaseCreated(params: {
    workspaceId: string;
    actorId?: string;
    caseId: string;
    title: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'CASE_CREATED',
      title: `Case created: ${params.title}`,
      description: `Case "${params.title}" was created.`,
      targetType: 'case',
      targetId: params.caseId,
    });
  }

  async recordCaseUpdated(params: {
    workspaceId: string;
    actorId?: string;
    caseId: string;
    title: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'CASE_UPDATED',
      title: `Case updated: ${params.title}`,
      description: `Case "${params.title}" was updated.`,
      targetType: 'case',
      targetId: params.caseId,
    });
  }

  async recordCaseClosed(params: {
    workspaceId: string;
    actorId?: string;
    caseId: string;
    title: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'CASE_CLOSED',
      title: `Case closed: ${params.title}`,
      description: `Case "${params.title}" was closed.`,
      targetType: 'case',
      targetId: params.caseId,
    });
  }

  async recordCaseAssigned(params: {
    workspaceId: string;
    actorId?: string;
    caseId: string;
    title: string;
    assigneeName: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'CASE_ASSIGNED',
      title: `Case assigned: ${params.title}`,
      description: `Case "${params.title}" assigned to ${params.assigneeName}.`,
      targetType: 'case',
      targetId: params.caseId,
    });
  }

  async recordClientAdded(params: {
    workspaceId: string;
    actorId?: string;
    clientId: string;
    name: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'CLIENT_ADDED',
      title: `Client added: ${params.name}`,
      description: `Client "${params.name}" was added.`,
      targetType: 'client',
      targetId: params.clientId,
    });
  }

  async recordInvoiceCreated(params: {
    workspaceId: string;
    actorId?: string;
    invoiceId: string;
    amount: number;
    currency: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'INVOICE_CREATED',
      title: 'Invoice created',
      description: `Invoice for ${params.currency} ${params.amount} was created.`,
      targetType: 'invoice',
      targetId: params.invoiceId,
    });
  }

  async recordInvoicePaid(params: {
    workspaceId: string;
    actorId?: string;
    amount: number;
    currency: string;
    targetId: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'INVOICE_PAID',
      title: 'Invoice paid',
      description: `Invoice payment of ${params.currency} ${params.amount} recorded.`,
      targetType: 'invoice',
      targetId: params.targetId,
    });
  }

  async recordRevenueAdded(params: {
    workspaceId: string;
    actorId?: string;
    amount: number;
    currency: string;
    targetId: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'REVENUE_ADDED',
      title: 'Revenue added',
      description: `Manual revenue of ${params.currency} ${params.amount} was added.`,
      targetType: 'manual_revenue',
      targetId: params.targetId,
    });
  }

  async recordDocumentUploaded(params: {
    workspaceId: string;
    actorId?: string;
    documentId: string;
    name: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'DOCUMENT_UPLOADED',
      title: `Document uploaded: ${params.name}`,
      description: `Document "${params.name}" was uploaded.`,
      targetType: 'document',
      targetId: params.documentId,
    });
  }

  async recordHearingScheduled(params: {
    workspaceId: string;
    actorId?: string;
    hearingId: string;
    title: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'HEARING_SCHEDULED',
      title: `Hearing scheduled: ${params.title}`,
      description: `Hearing "${params.title}" was scheduled.`,
      targetType: 'hearing',
      targetId: params.hearingId,
    });
  }

  async recordDeadlineUpdated(params: {
    workspaceId: string;
    actorId?: string;
    deadlineId: string;
    title: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'DEADLINE_UPDATED',
      title: `Deadline updated: ${params.title}`,
      description: `Deadline "${params.title}" was updated.`,
      targetType: 'deadline',
      targetId: params.deadlineId,
    });
  }

  async recordUserCreated(params: {
    workspaceId: string;
    actorId?: string;
    userId: string;
    fullName: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'USER_CREATED',
      title: `User created: ${params.fullName}`,
      description: `User "${params.fullName}" was created.`,
      targetType: 'user',
      targetId: params.userId,
    });
  }

  async recordUserUpdated(params: {
    workspaceId: string;
    actorId?: string;
    userId: string;
    fullName: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'USER_UPDATED',
      title: `User updated: ${params.fullName}`,
      description: `User "${params.fullName}" was updated.`,
      targetType: 'user',
      targetId: params.userId,
    });
  }

  async recordRoleChanged(params: {
    workspaceId: string;
    actorId?: string;
    userId: string;
    fullName: string;
    role: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'ROLE_CHANGED',
      title: `Role changed: ${params.fullName}`,
      description: `Role for "${params.fullName}" changed to ${params.role}.`,
      targetType: 'user',
      targetId: params.userId,
    });
  }

  async recordWorkspaceUpdated(params: {
    workspaceId: string;
    actorId?: string;
    name: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'WORKSPACE_UPDATED',
      title: `Workspace updated: ${params.name}`,
      description: `Workspace "${params.name}" was updated.`,
      targetType: 'workspace',
      targetId: params.workspaceId,
    });
  }

  async calculateRecent(workspaceId: string, take = 20): Promise<ActivitiesDto> {
    const [total, items] = await Promise.all([
      this.activityRepository.countActivities(workspaceId),
      this.activityRepository.findRecentActivities(workspaceId, take),
    ]);

    return {
      total,
      items: items.map(mapActivity),
    };
  }
}

function mapActivity(row: {
  id: string;
  workspaceId: string;
  type: ActivityType;
  title: string;
  description: string | null;
  entityType: string | null;
  entityId: string | null;
  userId: string | null;
  createdAt: Date;
  actor: { id: string; fullName: string; email: string } | null;
}): ActivityItemDto {
  const timestamp = row.createdAt.toISOString();

  return {
    id: row.id,
    type: row.type,
    action: row.type,
    title: row.title,
    description: row.description,
    actor: row.actor,
    target:
      row.entityType && row.entityId
        ? { type: row.entityType, id: row.entityId }
        : null,
    workspaceId: row.workspaceId,
    timestamp,
    entityType: row.entityType,
    entityId: row.entityId,
    userId: row.userId,
    createdAt: timestamp,
  };
}
