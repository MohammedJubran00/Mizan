import type {
  ActiveCasesCardDto,
  BillableHoursCardDto,
  CaseMixDto,
  ChartSeriesPointDto,
  ClientsCardDto,
  WinRateCardDto,
} from '../dto';
import type { DashboardCaseRepository } from '../repositories/dashboard-case.repository';
import type { DashboardClientRepository } from '../repositories/dashboard-client.repository';

export interface CaseStatisticsResult {
  activeCases: ActiveCasesCardDto;
  winRate: WinRateCardDto;
  billableHours: BillableHoursCardDto;
  clients: ClientsCardDto;
  caseMix: CaseMixDto;
}

/**
 * Case / client / win-rate / billable-hours statistics for one workspace.
 */
export class CaseStatisticsService {
  constructor(
    private readonly caseRepository: DashboardCaseRepository,
    private readonly clientRepository: DashboardClientRepository,
  ) {}

  async calculate(workspaceId: string): Promise<CaseStatisticsResult> {
    const [
      active,
      open,
      closed,
      total,
      won,
      lost,
      billableHoursTotal,
      billableCaseCount,
      clientsTotal,
      byStatus,
      byPracticeArea,
    ] = await Promise.all([
      this.caseRepository.countActiveCases(workspaceId),
      this.caseRepository.countOpenCases(workspaceId),
      this.caseRepository.countClosedCases(workspaceId),
      this.caseRepository.countTotalCases(workspaceId),
      this.caseRepository.countWonCases(workspaceId),
      this.caseRepository.countLostCases(workspaceId),
      this.caseRepository.sumBillableHours(workspaceId),
      this.caseRepository.countCasesWithBillableHours(workspaceId),
      this.clientRepository.countClients(workspaceId),
      this.caseRepository.groupByStatus(workspaceId),
      this.caseRepository.groupByPracticeArea(workspaceId),
    ]);

    const decided = won + lost;
    const winRate = decided === 0 ? 0 : Math.round((won / decided) * 10000) / 100;
    const averagePerCase =
      billableCaseCount === 0
        ? 0
        : Math.round((billableHoursTotal / billableCaseCount) * 100) / 100;

    const statusSeries: ChartSeriesPointDto[] = byStatus.map((row) => ({
      label: row.status,
      value: row.count,
    }));

    const practiceSeries: ChartSeriesPointDto[] = byPracticeArea.map((row) => ({
      label: row.practiceArea,
      value: row.count,
    }));

    return {
      activeCases: {
        active,
        open,
        closed,
        total,
        trendLabel: total === 0 ? 'No cases yet' : `${active} active`,
      },
      winRate: {
        winRate,
        won,
        lost,
        decided,
        trendLabel: decided === 0 ? 'No decided cases' : `${winRate}% win rate`,
      },
      billableHours: {
        totalHours: billableHoursTotal,
        caseCount: billableCaseCount,
        averagePerCase,
        trendLabel:
          billableHoursTotal === 0 ? 'No billable hours' : `${billableHoursTotal} hours`,
      },
      clients: {
        total: clientsTotal,
        trendLabel: clientsTotal === 0 ? 'No clients yet' : `${clientsTotal} clients`,
      },
      caseMix: {
        byStatus: statusSeries,
        byPracticeArea: practiceSeries,
      },
    };
  }
}
