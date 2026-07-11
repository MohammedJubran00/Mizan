import type { ActivitySeverity, ActivityType, Prisma, PrismaClient } from '@prisma/client';

import { decodeCursor } from '../utils/timeline-format';

export interface ActivityTimelineRow {
  id: string;
  workspaceId: string;
  type: ActivityType;
  title: string;
  description: string | null;
  entityType: string | null;
  entityId: string | null;
  targetName: string | null;
  severity: ActivitySeverity;
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
}

export interface ActivityTimelineQuery {
  workspaceId: string;
  page: number;
  pageSize: number;
  cursor?: string;
  type?: string;
  actorId?: string;
  search?: string;
  from?: Date;
  to?: Date;
}

export class TimelineActivityRepository {
  constructor(private readonly db: PrismaClient) {}

  async count(query: ActivityTimelineQuery): Promise<number> {
    return this.db.activity.count({ where: this.buildWhere(query) });
  }

  async list(query: ActivityTimelineQuery): Promise<ActivityTimelineRow[]> {
    const rows = await this.db.activity.findMany({
      where: this.buildWhere(query),
      select: {
        id: true,
        workspaceId: true,
        type: true,
        title: true,
        description: true,
        entityType: true,
        entityId: true,
        targetName: true,
        severity: true,
        icon: true,
        color: true,
        metadata: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: query.cursor ? 0 : (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });

    return rows.map((row) => ({
      id: row.id,
      workspaceId: row.workspaceId,
      type: row.type,
      title: row.title,
      description: row.description,
      entityType: row.entityType,
      entityId: row.entityId,
      targetName: row.targetName,
      severity: row.severity,
      icon: row.icon,
      color: row.color,
      metadata: row.metadata,
      userId: row.userId,
      createdAt: row.createdAt,
      actor: row.user,
    }));
  }

  private buildWhere(query: ActivityTimelineQuery): Prisma.ActivityWhereInput {
    const where: Prisma.ActivityWhereInput = {
      workspaceId: query.workspaceId,
    };

    if (query.type) {
      where.type = query.type as ActivityType;
    }

    if (query.actorId) {
      where.userId = query.actorId;
    }

    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: query.from } : {}),
        ...(query.to ? { lt: query.to } : {}),
      };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { targetName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.cursor) {
      const decoded = decodeCursor(query.cursor);
      if (decoded) {
        where.AND = [
          {
            OR: [
              { createdAt: { lt: decoded.createdAt } },
              { createdAt: decoded.createdAt, id: { lt: decoded.id } },
            ],
          },
        ];
      }
    }

    return where;
  }
}

export class TimelineAlertRepository {
  constructor(private readonly db: PrismaClient) {}

  async findHearingsToday(workspaceId: string, period: { start: Date; end: Date }) {
    return this.db.hearing.findMany({
      where: {
        workspaceId,
        status: 'SCHEDULED',
        scheduledAt: { gte: period.start, lt: period.end },
      },
      select: { id: true, title: true, scheduledAt: true },
      orderBy: { scheduledAt: 'asc' },
      take: 20,
    });
  }

  async findDeadlinesTomorrow(workspaceId: string, period: { start: Date; end: Date }) {
    return this.db.deadline.findMany({
      where: {
        workspaceId,
        status: { in: ['PENDING', 'OVERDUE'] },
        dueAt: { gte: period.start, lt: period.end },
      },
      select: { id: true, title: true, dueAt: true },
      orderBy: { dueAt: 'asc' },
      take: 20,
    });
  }

  async findOverdueCases(workspaceId: string, now: Date) {
    return this.db.deadline.findMany({
      where: {
        workspaceId,
        status: { in: ['PENDING', 'OVERDUE'] },
        dueAt: { lt: now },
        caseId: { not: null },
      },
      select: {
        id: true,
        title: true,
        caseId: true,
        case: { select: { title: true } },
      },
      orderBy: { dueAt: 'asc' },
      take: 10,
    });
  }

  async findOverdueInvoices(workspaceId: string) {
    return this.db.invoice.findMany({
      where: { workspaceId, status: 'OVERDUE' },
      select: { id: true, amount: true, currency: true, clientId: true },
      take: 10,
    });
  }

  async findClientsWithUnpaidInvoices(workspaceId: string) {
    const rows = await this.db.invoice.groupBy({
      by: ['clientId'],
      where: {
        workspaceId,
        status: { in: ['SENT', 'OVERDUE'] },
        clientId: { not: null },
      },
      _count: { _all: true },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    });

    const clientIds = rows
      .map((row) => row.clientId)
      .filter((id): id is string => id != null);

    if (clientIds.length === 0) {
      return [];
    }

    const clients = await this.db.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true },
    });

    const nameById = new Map(clients.map((client) => [client.id, client.name]));

    return rows
      .filter((row): row is typeof row & { clientId: string } => row.clientId != null)
      .map((row) => ({
        clientId: row.clientId,
        clientName: nameById.get(row.clientId) ?? 'Client',
        unpaidCount: row._count._all,
        unpaidAmount: Number(row._sum.amount ?? 0),
      }));
  }

  async countUrgentDeadlines(workspaceId: string, within: Date, now: Date): Promise<number> {
    return this.db.deadline.count({
      where: {
        workspaceId,
        status: { in: ['PENDING', 'OVERDUE'] },
        dueAt: { gte: now, lt: within },
      },
    });
  }
}
