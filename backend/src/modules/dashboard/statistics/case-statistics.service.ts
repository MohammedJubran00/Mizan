import { round2, safeDivide, toPercentageDistribution } from '../../../shared/utils/math';
import type { WorkspacePeriods } from '../../../shared/utils/timezone';
import type {
  ActiveCasesCardDto,
  BillableHoursCardDto,
  CaseMixDto,
  CaseOverviewStatsDto,
  WinRateCardDto,
} from '../dto';
import type { DashboardCaseRepository } from '../repositories/dashboard-case.repository';

export interface CaseStatisticsResult {
  overview: CaseOverviewStatsDto;
  activeCases: ActiveCasesCardDto;
  winRate: WinRateCardDto;
  billableHours: BillableHoursCardDto;
  caseMix: CaseMixDto;
}

/**
 * Case, win-rate, case-mix, and billable-hours statistics for one workspace.
 */
export class CaseStatisticsService {
  constructor(private readonly caseRepository: DashboardCaseRepository) {}

  async calculate(
    workspaceId: string,
    periods: WorkspacePeriods,
  ): Promise<CaseStatisticsResult> {
    const [
      active,
      open,
      closed,
      total,
      won,
      lost,
      pending,
      draft,
      billableHoursOnCases,
      billableCaseCount,
      entryLifetime,
      entryToday,
      entryWeek,
      entryMonth,
      entryYear,
      byStatus,
      byPracticeArea,
    ] = await Promise.all([
      this.caseRepository.countActiveCases(workspaceId),
      this.caseRepository.countOpenCases(workspaceId),
      this.caseRepository.countClosedCases(workspaceId),
      this.caseRepository.countTotalCases(workspaceId),
      this.caseRepository.countWonCases(workspaceId),
      this.caseRepository.countLostCases(workspaceId),
      this.caseRepository.countPendingCases(workspaceId),
      this.caseRepository.countDraftCases(workspaceId),
      this.caseRepository.sumBillableHours(workspaceId),
      this.caseRepository.countCasesWithBillableHours(workspaceId),
      this.caseRepository.sumAllBillableHourEntries(workspaceId),
      this.caseRepository.sumBillableHoursInPeriod(workspaceId, periods.today),
      this.caseRepository.sumBillableHoursInPeriod(workspaceId, periods.thisWeek),
      this.caseRepository.sumBillableHoursInPeriod(workspaceId, periods.thisMonth),
      this.caseRepository.sumBillableHoursInPeriod(workspaceId, periods.thisYear),
      this.caseRepository.groupByStatus(workspaceId),
      this.caseRepository.groupByPracticeArea(workspaceId),
    ]);

    const winRate =
      closed === 0 ? 0 : round2(safeDivide(won, closed) * 100);

    const totalHours = entryLifetime > 0 ? entryLifetime : billableHoursOnCases;
    const averagePerCase =
      billableCaseCount === 0 ? 0 : round2(safeDivide(totalHours, billableCaseCount));

    const statusMix = toPercentageDistribution(
      byStatus.map((row) => ({ label: row.status, value: row.count })),
    );

    const practiceMix = toPercentageDistribution(
      byPracticeArea.map((row) => ({ label: row.practiceArea, value: row.count })),
    );

    const overview: CaseOverviewStatsDto = {
      total,
      active,
      closed,
      won,
      lost,
      pending,
      draft,
      open,
    };

    return {
      overview,
      activeCases: {
        active,
        open,
        closed,
        total,
        pending,
        draft,
        won,
        lost,
        trendLabel: total === 0 ? 'No cases yet' : `${active} active`,
      },
      winRate: {
        winRate,
        won,
        lost,
        closed,
        decided: won + lost,
        trendLabel: closed === 0 ? 'No closed cases' : `${winRate}% win rate`,
      },
      billableHours: {
        totalHours,
        caseCount: billableCaseCount,
        averagePerCase,
        periods: {
          today: entryToday,
          week: entryWeek,
          month: entryMonth,
          year: entryYear,
          lifetime: totalHours,
        },
        trendLabel: totalHours === 0 ? 'No billable hours' : `${totalHours} hours`,
      },
      caseMix: {
        byStatus: statusMix,
        byPracticeArea: practiceMix,
      },
    };
  }
}
