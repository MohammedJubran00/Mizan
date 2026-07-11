import { round2, safeDivide } from '../../../shared/utils/math';
import type { TeamDto } from '../dto';
import type { DashboardCaseRepository } from '../repositories/dashboard-case.repository';
import type { DashboardTeamRepository } from '../repositories/dashboard-team.repository';

/**
 * Team statistics — roles are read from the database, never hardcoded counts.
 */
export class TeamStatisticsService {
  constructor(
    private readonly teamRepository: DashboardTeamRepository,
    private readonly caseRepository: DashboardCaseRepository,
  ) {}

  async calculate(workspaceId: string): Promise<TeamDto> {
    const [totalUsers, activeUsers, roleRows, lawyerCount, members, lawyerAggregates] =
      await Promise.all([
        this.teamRepository.countMembers(workspaceId),
        this.teamRepository.countActiveMembers(workspaceId),
        this.teamRepository.countByRole(workspaceId),
        this.teamRepository.countLawyers(workspaceId),
        this.teamRepository.findMembers(workspaceId, 50),
        this.caseRepository.aggregateByLawyer(workspaceId),
      ]);

    const byRole: Record<string, number> = {};
    for (const row of roleRows) {
      byRole[row.role] = row.count;
    }

    const lawyersWithCases = lawyerAggregates.length;
    const totalAssigned = lawyerAggregates.reduce((sum, row) => sum + row.totalCases, 0);
    const totalClosed = lawyerAggregates.reduce((sum, row) => sum + row.closedCases, 0);
    const totalWon = lawyerAggregates.reduce((sum, row) => sum + row.wonCases, 0);

    const divisor = lawyersWithCases > 0 ? lawyersWithCases : lawyerCount;
    const averageCasesPerLawyer =
      divisor === 0 ? 0 : round2(safeDivide(totalAssigned, divisor));
    const averageClosedCases =
      divisor === 0 ? 0 : round2(safeDivide(totalClosed, divisor));
    const averageWinRate =
      totalClosed === 0 ? 0 : round2(safeDivide(totalWon, totalClosed) * 100);

    return {
      totalUsers,
      activeUsers,
      roles: {
        byRole,
        lawyers: byRole.LAWYER ?? 0,
        assistants: byRole.ASSISTANT ?? 0,
        admins: byRole.ADMIN ?? 0,
        owners: byRole.OWNER ?? 0,
        members: byRole.MEMBER ?? 0,
      },
      averageCasesPerLawyer,
      averageClosedCases,
      averageWinRate,
      memberCount: totalUsers,
      members: members.map((member) => ({
        userId: member.userId,
        fullName: member.fullName,
        /** Email redacted on dashboard aggregation — not required for widgets. */
        email: '',
        role: member.role,
        isActive: member.isActive,
      })),
    };
  }
}
