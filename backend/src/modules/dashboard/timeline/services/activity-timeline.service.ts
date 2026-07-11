import type { ActivityType, Prisma } from '@prisma/client';

import type {
  ActivitiesDashboardDto,
  ActivityGroupDto,
  ActivityGroupKey,
  TimelineActivityDto,
} from '../dto/timeline.dto';
import type { TimelineFilterInput } from '../filters/timeline-filter';
import type { TimelineActivityRepository } from '../repositories/timeline-activity-alert.repository';
import {
  ACTIVITY_GROUP_LABELS,
  buildPaginationMeta,
  formatRelativeTime,
  resolveActivityGroupKey,
} from '../utils/timeline-format';

const ACTIVITY_STYLE: Record<
  string,
  { icon: string; color: string; severity: string }
> = {
  CASE_CREATED: { icon: 'case', color: '#2563EB', severity: 'INFO' },
  CASE_UPDATED: { icon: 'case', color: '#3B82F6', severity: 'INFO' },
  CASE_CLOSED: { icon: 'case-check', color: '#16A34A', severity: 'SUCCESS' },
  CASE_ASSIGNED: { icon: 'user-check', color: '#0EA5E9', severity: 'INFO' },
  CLIENT_ADDED: { icon: 'client', color: '#7C3AED', severity: 'INFO' },
  CLIENT_UPDATED: { icon: 'client', color: '#8B5CF6', severity: 'INFO' },
  INVOICE_CREATED: { icon: 'invoice', color: '#D97706', severity: 'INFO' },
  INVOICE_PAID: { icon: 'invoice-check', color: '#16A34A', severity: 'SUCCESS' },
  REVENUE_ADDED: { icon: 'revenue', color: '#059669', severity: 'SUCCESS' },
  DOCUMENT_UPLOADED: { icon: 'document', color: '#4F46E5', severity: 'INFO' },
  DOCUMENT_DELETED: { icon: 'document-x', color: '#DC2626', severity: 'WARNING' },
  HEARING_SCHEDULED: { icon: 'hearing', color: '#EA580C', severity: 'WARNING' },
  HEARING_UPDATED: { icon: 'hearing', color: '#F97316', severity: 'INFO' },
  DEADLINE_ADDED: { icon: 'deadline', color: '#DB2777', severity: 'WARNING' },
  DEADLINE_UPDATED: { icon: 'deadline', color: '#EC4899', severity: 'INFO' },
  TASK_COMPLETED: { icon: 'task', color: '#16A34A', severity: 'SUCCESS' },
  USER_INVITED: { icon: 'user-plus', color: '#2563EB', severity: 'INFO' },
  USER_REMOVED: { icon: 'user-minus', color: '#DC2626', severity: 'WARNING' },
  ROLE_CHANGED: { icon: 'shield', color: '#7C3AED', severity: 'INFO' },
  WORKSPACE_UPDATED: { icon: 'building', color: '#475569', severity: 'INFO' },
  THEME_CHANGED: { icon: 'palette', color: '#64748B', severity: 'INFO' },
  PROFILE_UPDATED: { icon: 'profile', color: '#64748B', severity: 'INFO' },
  LOGIN: { icon: 'login', color: '#64748B', severity: 'INFO' },
  LOGOUT: { icon: 'logout', color: '#64748B', severity: 'INFO' },
  OTHER: { icon: 'activity', color: '#64748B', severity: 'INFO' },
};

/**
 * Activity Timeline Engine — dashboard consumes this; modules publish via ActivityEngineService.
 */
export class ActivityTimelineService {
  constructor(private readonly activityRepository: TimelineActivityRepository) {}

  async calculate(input: {
    workspaceId: string;
    now: Date;
    timezone: string;
    filter: TimelineFilterInput;
  }): Promise<ActivitiesDashboardDto> {
    const query = {
      workspaceId: input.workspaceId,
      page: input.filter.activityPage,
      pageSize: input.filter.activityPageSize,
      cursor: input.filter.activityCursor,
      type: input.filter.activityType,
      actorId: input.filter.activityActorId,
      search: input.filter.activitySearch,
      from: input.filter.activityFrom,
      to: input.filter.activityTo,
    };

    const [total, rows] = await Promise.all([
      this.activityRepository.count(query),
      this.activityRepository.list(query),
    ]);

    const items = rows.map((row) => mapTimelineActivity(row, input.now));
    const groups = groupActivities(items, input.now, input.timezone);

    const pagination = buildPaginationMeta({
      page: input.filter.activityPage,
      pageSize: input.filter.activityPageSize,
      total,
      items: rows.map((row) => ({ id: row.id, createdAt: row.createdAt })),
      cursorField: 'createdAt',
    });

    return {
      total,
      items,
      groups,
      pagination,
    };
  }
}

function mapTimelineActivity(
  row: {
    id: string;
    workspaceId: string;
    type: ActivityType;
    title: string;
    description: string | null;
    entityType: string | null;
    entityId: string | null;
    targetName: string | null;
    severity: string;
    icon: string | null;
    color: string | null;
    metadata: Prisma.JsonValue | null;
    userId: string | null;
    createdAt: Date;
    actor: {
      id: string;
      fullName: string;
      email: string;
      avatarUrl: string | null;
    } | null;
  },
  now: Date,
): TimelineActivityDto {
  const style = ACTIVITY_STYLE[row.type] ?? ACTIVITY_STYLE.OTHER!;
  const timestamp = row.createdAt.toISOString();
  const metadata =
    row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : null;

  return {
    id: row.id,
    workspaceId: row.workspaceId,
    actor: row.actor
      ? {
          id: row.actor.id,
          fullName: row.actor.fullName,
          email: row.actor.email,
          avatarUrl: row.actor.avatarUrl,
        }
      : null,
    actorAvatar: row.actor?.avatarUrl ?? null,
    action: row.type,
    type: row.type,
    targetType: row.entityType,
    targetId: row.entityId,
    targetName: row.targetName,
    title: row.title,
    description: row.description,
    icon: row.icon ?? style.icon,
    color: row.color ?? style.color,
    timestamp,
    relativeTime: formatRelativeTime(row.createdAt, now),
    severity: row.severity || style.severity,
    metadata,
    entityType: row.entityType,
    entityId: row.entityId,
    userId: row.userId,
    createdAt: timestamp,
  };
}

function groupActivities(
  items: TimelineActivityDto[],
  now: Date,
  timezone: string,
): ActivityGroupDto[] {
  const order: ActivityGroupKey[] = [
    'TODAY',
    'YESTERDAY',
    'EARLIER_THIS_WEEK',
    'EARLIER_THIS_MONTH',
    'OLDER',
  ];

  const buckets = new Map<ActivityGroupKey, TimelineActivityDto[]>();
  for (const key of order) {
    buckets.set(key, []);
  }

  for (const item of items) {
    const key = resolveActivityGroupKey(new Date(item.timestamp), now, timezone);
    buckets.get(key)?.push(item);
  }

  return order
    .map((key) => ({
      key,
      label: ACTIVITY_GROUP_LABELS[key],
      items: buckets.get(key) ?? [],
    }))
    .filter((group) => group.items.length > 0);
}
