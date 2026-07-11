import type { ActivitySeverity, ActivityType, Prisma } from '@prisma/client';

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
  targetName?: string | null;
  severity?: ActivitySeverity;
  icon?: string | null;
  color?: string | null;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Reusable Activity publisher / audit-ready engine.
 * Future modules publish events here without coupling to the Dashboard.
 * The Dashboard timeline consumes via ActivityTimelineService.
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
      targetName: params.title,
      icon: 'case',
      color: '#2563EB',
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
      targetName: params.title,
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
      targetName: params.title,
      severity: 'SUCCESS',
      icon: 'case-check',
      color: '#16A34A',
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
      targetName: params.title,
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
      targetName: params.name,
    });
  }

  async recordClientUpdated(params: {
    workspaceId: string;
    actorId?: string;
    clientId: string;
    name: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'CLIENT_UPDATED',
      title: `Client updated: ${params.name}`,
      description: `Client "${params.name}" was updated.`,
      targetType: 'client',
      targetId: params.clientId,
      targetName: params.name,
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
      targetName: `Invoice ${params.invoiceId.slice(0, 8)}`,
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
      severity: 'SUCCESS',
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
      severity: 'SUCCESS',
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
      targetName: params.name,
    });
  }

  async recordDocumentDeleted(params: {
    workspaceId: string;
    actorId?: string;
    documentId: string;
    name: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'DOCUMENT_DELETED',
      title: `Document deleted: ${params.name}`,
      description: `Document "${params.name}" was deleted.`,
      targetType: 'document',
      targetId: params.documentId,
      targetName: params.name,
      severity: 'WARNING',
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
      targetName: params.title,
      severity: 'WARNING',
    });
  }

  async recordHearingUpdated(params: {
    workspaceId: string;
    actorId?: string;
    hearingId: string;
    title: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'HEARING_UPDATED',
      title: `Hearing updated: ${params.title}`,
      description: `Hearing "${params.title}" was updated.`,
      targetType: 'hearing',
      targetId: params.hearingId,
      targetName: params.title,
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
      targetName: params.title,
    });
  }

  async recordTaskCompleted(params: {
    workspaceId: string;
    actorId?: string;
    taskId: string;
    title: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'TASK_COMPLETED',
      title: `Task completed: ${params.title}`,
      description: `Task "${params.title}" was completed.`,
      targetType: 'task',
      targetId: params.taskId,
      targetName: params.title,
      severity: 'SUCCESS',
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
      targetName: params.fullName,
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
      targetName: params.fullName,
    });
  }

  async recordUserInvited(params: {
    workspaceId: string;
    actorId?: string;
    userId: string;
    fullName: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'USER_INVITED',
      title: `User invited: ${params.fullName}`,
      description: `User "${params.fullName}" was invited.`,
      targetType: 'user',
      targetId: params.userId,
      targetName: params.fullName,
    });
  }

  async recordUserRemoved(params: {
    workspaceId: string;
    actorId?: string;
    userId: string;
    fullName: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'USER_REMOVED',
      title: `User removed: ${params.fullName}`,
      description: `User "${params.fullName}" was removed.`,
      targetType: 'user',
      targetId: params.userId,
      targetName: params.fullName,
      severity: 'WARNING',
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
      targetName: params.fullName,
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
      targetName: params.name,
    });
  }

  async recordThemeChanged(params: {
    workspaceId: string;
    actorId?: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'THEME_CHANGED',
      title: 'Theme changed',
      description: 'Workspace theme was updated.',
      targetType: 'workspace',
      targetId: params.workspaceId,
    });
  }

  async recordProfileUpdated(params: {
    workspaceId: string;
    actorId?: string;
    userId: string;
    fullName: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'PROFILE_UPDATED',
      title: `Profile updated: ${params.fullName}`,
      description: `Profile for "${params.fullName}" was updated.`,
      targetType: 'user',
      targetId: params.userId,
      targetName: params.fullName,
    });
  }

  async recordLogin(params: {
    workspaceId: string;
    actorId?: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'LOGIN',
      title: 'User logged in',
      description: 'A user signed in to the workspace.',
      targetType: 'workspace',
      targetId: params.workspaceId,
    });
  }

  async recordLogout(params: {
    workspaceId: string;
    actorId?: string;
  }): Promise<ActivityItemDto> {
    return this.record({
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      type: 'LOGOUT',
      title: 'User logged out',
      description: 'A user signed out of the workspace.',
      targetType: 'workspace',
      targetId: params.workspaceId,
    });
  }

  /** Legacy helper used by older dashboard stats — prefer ActivityTimelineService. */
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
  actor: { id: string; fullName: string; email: string; avatarUrl?: string | null } | null;
}): ActivityItemDto {
  const timestamp = row.createdAt.toISOString();

  return {
    id: row.id,
    type: row.type,
    action: row.type,
    title: row.title,
    description: row.description,
    actor: row.actor
      ? {
          id: row.actor.id,
          fullName: row.actor.fullName,
          email: row.actor.email,
        }
      : null,
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
