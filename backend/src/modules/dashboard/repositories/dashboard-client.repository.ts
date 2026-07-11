import type { PrismaClient } from '@prisma/client';

import type { PeriodBounds } from '../../../shared/utils/timezone';

export class DashboardClientRepository {
  constructor(private readonly db: PrismaClient) {}

  async countClients(workspaceId: string): Promise<number> {
    return this.db.client.count({ where: { workspaceId } });
  }

  async countActiveClients(workspaceId: string): Promise<number> {
    return this.db.client.count({
      where: { workspaceId, status: 'ACTIVE' },
    });
  }

  async countInactiveClients(workspaceId: string): Promise<number> {
    return this.db.client.count({
      where: { workspaceId, status: 'INACTIVE' },
    });
  }

  async countNewClientsInPeriod(
    workspaceId: string,
    period: PeriodBounds,
  ): Promise<number> {
    return this.db.client.count({
      where: {
        workspaceId,
        createdAt: { gte: period.start, lt: period.end },
      },
    });
  }

  /** Clients with two or more cases (returning / repeat engagement). */
  async countReturningClients(workspaceId: string): Promise<number> {
    const rows = await this.db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM (
        SELECT c."clientId"
        FROM "cases" c
        WHERE c."workspaceId" = ${workspaceId}
          AND c."clientId" IS NOT NULL
        GROUP BY c."clientId"
        HAVING COUNT(*) >= 2
      ) returning_clients
    `;

    return Number(rows[0]?.count ?? 0);
  }
}
