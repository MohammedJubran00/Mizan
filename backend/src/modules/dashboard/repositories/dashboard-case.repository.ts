import type { CaseStatus, PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface CaseStatusCount {
  status: CaseStatus;
  count: number;
}

export interface PracticeAreaCount {
  practiceArea: string;
  count: number;
}

export class DashboardCaseRepository {
  constructor(private readonly db: PrismaClient) {}

  async countByStatuses(workspaceId: string, statuses: CaseStatus[]): Promise<number> {
    return this.db.case.count({
      where: { workspaceId, status: { in: statuses } },
    });
  }

  async countActiveCases(workspaceId: string): Promise<number> {
    return this.countByStatuses(workspaceId, ['OPEN', 'ACTIVE']);
  }

  async countOpenCases(workspaceId: string): Promise<number> {
    return this.countByStatuses(workspaceId, ['OPEN']);
  }

  async countClosedCases(workspaceId: string): Promise<number> {
    return this.countByStatuses(workspaceId, ['CLOSED', 'WON', 'LOST']);
  }

  async countTotalCases(workspaceId: string): Promise<number> {
    return this.db.case.count({ where: { workspaceId } });
  }

  async countWonCases(workspaceId: string): Promise<number> {
    return this.countByStatuses(workspaceId, ['WON']);
  }

  async countLostCases(workspaceId: string): Promise<number> {
    return this.countByStatuses(workspaceId, ['LOST']);
  }

  async sumBillableHours(workspaceId: string): Promise<number> {
    const result = await this.db.case.aggregate({
      where: { workspaceId },
      _sum: { billableHours: true },
      _count: { _all: true },
    });

    return decimalToNumber(result._sum.billableHours);
  }

  async countCasesWithBillableHours(workspaceId: string): Promise<number> {
    return this.db.case.count({
      where: {
        workspaceId,
        billableHours: { gt: 0 },
      },
    });
  }

  async groupByStatus(workspaceId: string): Promise<CaseStatusCount[]> {
    const rows = await this.db.case.groupBy({
      by: ['status'],
      where: { workspaceId },
      _count: { _all: true },
    });

    return rows.map((row) => ({
      status: row.status,
      count: row._count._all,
    }));
  }

  async groupByPracticeArea(workspaceId: string): Promise<PracticeAreaCount[]> {
    const rows = await this.db.case.groupBy({
      by: ['practiceArea'],
      where: {
        workspaceId,
        practiceArea: { not: null },
      },
      _count: { _all: true },
      orderBy: { _count: { practiceArea: 'desc' } },
    });

    return rows
      .filter((row): row is typeof row & { practiceArea: string } => row.practiceArea !== null)
      .map((row) => ({
        practiceArea: row.practiceArea,
        count: row._count._all,
      }));
  }
}

function decimalToNumber(value: Prisma.Decimal | null | undefined): number {
  if (value == null) {
    return 0;
  }
  return Number(value);
}
