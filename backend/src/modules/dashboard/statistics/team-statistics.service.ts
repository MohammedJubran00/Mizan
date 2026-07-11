import type { TeamDto } from '../dto';
import type { DashboardTeamRepository } from '../repositories/dashboard-team.repository';

/**
 * Workspace team membership statistics.
 */
export class TeamStatisticsService {
  constructor(private readonly teamRepository: DashboardTeamRepository) {}

  async calculate(workspaceId: string): Promise<TeamDto> {
    const [memberCount, members] = await Promise.all([
      this.teamRepository.countMembers(workspaceId),
      this.teamRepository.findMembers(workspaceId, 20),
    ]);

    return {
      memberCount,
      members: members.map((member) => ({
        userId: member.userId,
        fullName: member.fullName,
        email: member.email,
        role: member.role,
      })),
    };
  }
}
