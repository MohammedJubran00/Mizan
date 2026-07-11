import { getZonedParts, normalizeTimezone } from '../../../../shared/utils/timezone';
import type { ActivityGroupKey } from '../dto/timeline.dto';

export function formatRelativeTime(timestamp: Date, now: Date): string {
  const diffMs = now.getTime() - timestamp.getTime();
  const abs = Math.abs(diffMs);
  const minutes = Math.floor(abs / 60000);
  const hours = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);

  if (minutes < 1) {
    return diffMs >= 0 ? 'just now' : 'in a moment';
  }
  if (minutes < 60) {
    return diffMs >= 0 ? `${minutes}m ago` : `in ${minutes}m`;
  }
  if (hours < 24) {
    return diffMs >= 0 ? `${hours}h ago` : `in ${hours}h`;
  }
  if (days < 7) {
    return diffMs >= 0 ? `${days}d ago` : `in ${days}d`;
  }
  return timestamp.toISOString().slice(0, 10);
}

export function formatLocalDate(date: Date, timeZone: string): string {
  const parts = getZonedParts(date, normalizeTimezone(timeZone));
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function formatLocalTime(date: Date, timeZone: string): string {
  const parts = getZonedParts(date, normalizeTimezone(timeZone));
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
}

export function resolveActivityGroupKey(
  createdAt: Date,
  now: Date,
  timeZone: string,
): ActivityGroupKey {
  const tz = normalizeTimezone(timeZone);
  const created = getZonedParts(createdAt, tz);
  const current = getZonedParts(now, tz);

  const createdDay = Date.UTC(created.year, created.month - 1, created.day);
  const currentDay = Date.UTC(current.year, current.month - 1, current.day);
  const dayDiff = Math.floor((currentDay - createdDay) / 86400000);

  if (dayDiff === 0) {
    return 'TODAY';
  }
  if (dayDiff === 1) {
    return 'YESTERDAY';
  }

  // Monday-based week
  const dow = new Date(currentDay).getUTCDay();
  const daysFromMonday = (dow + 6) % 7;
  if (dayDiff <= daysFromMonday) {
    return 'EARLIER_THIS_WEEK';
  }

  if (created.year === current.year && created.month === current.month) {
    return 'EARLIER_THIS_MONTH';
  }

  return 'OLDER';
}

export const ACTIVITY_GROUP_LABELS: Record<ActivityGroupKey, string> = {
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  EARLIER_THIS_WEEK: 'Earlier This Week',
  EARLIER_THIS_MONTH: 'Earlier This Month',
  OLDER: 'Older',
};

export function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}|${id}`, 'utf8').toString('base64url');
}

export function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    const [iso, id] = raw.split('|');
    if (!iso || !id) {
      return null;
    }
    const createdAt = new Date(iso);
    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }
    return { createdAt, id };
  } catch {
    return null;
  }
}

export function buildPaginationMeta(input: {
  page: number;
  pageSize: number;
  total: number;
  items: Array<{ createdAt?: Date; scheduledAt?: Date; dueAt?: Date; id: string }>;
  cursorField: 'createdAt' | 'scheduledAt' | 'dueAt';
}): {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
} {
  const totalPages = input.total === 0 ? 0 : Math.ceil(input.total / input.pageSize);
  const hasMore = input.page < totalPages;
  const last = input.items[input.items.length - 1];
  const first = input.items[0];

  const toCursor = (
    item: { createdAt?: Date; scheduledAt?: Date; dueAt?: Date; id: string } | undefined,
  ): string | null => {
    if (!item) {
      return null;
    }
    const date = item[input.cursorField];
    if (!date) {
      return null;
    }
    return encodeCursor(date, item.id);
  };

  return {
    page: input.page,
    pageSize: input.pageSize,
    total: input.total,
    totalPages,
    hasMore,
    nextCursor: hasMore ? toCursor(last) : null,
    prevCursor: input.page > 1 ? toCursor(first) : null,
  };
}
