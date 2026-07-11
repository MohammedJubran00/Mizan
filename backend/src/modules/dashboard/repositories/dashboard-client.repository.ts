import type { PrismaClient } from '@prisma/client';

export class DashboardClientRepository {
  constructor(private readonly db: PrismaClient) {}

  async countClients(workspaceId: string): Promise<number> {
    return this.db.client.count({ where: { workspaceId } });
  }
}
