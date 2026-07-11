import type { WorkspacePeriods } from '../../../shared/utils/timezone';
import type { ClientsCardDto } from '../dto';
import type { DashboardClientRepository } from '../repositories/dashboard-client.repository';

/**
 * Client statistics for one workspace.
 */
export class ClientStatisticsService {
  constructor(private readonly clientRepository: DashboardClientRepository) {}

  async calculate(
    workspaceId: string,
    periods: WorkspacePeriods,
  ): Promise<ClientsCardDto> {
    const [total, active, inactive, newThisMonth, returning] = await Promise.all([
      this.clientRepository.countClients(workspaceId),
      this.clientRepository.countActiveClients(workspaceId),
      this.clientRepository.countInactiveClients(workspaceId),
      this.clientRepository.countNewClientsInPeriod(workspaceId, periods.thisMonth),
      this.clientRepository.countReturningClients(workspaceId),
    ]);

    return {
      total,
      active,
      inactive,
      newThisMonth,
      returning,
      trendLabel: total === 0 ? 'No clients yet' : `${total} clients`,
    };
  }
}
