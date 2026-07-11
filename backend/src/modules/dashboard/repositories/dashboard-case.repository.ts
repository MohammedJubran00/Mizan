import type { CaseStatus, PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

import type { PeriodBounds } from '../../../shared/utils/timezone';

export interface CaseStatusCount {
  status: CaseStatus;
  count: number;
}

export interface PracticeAreaCount {
  practiceArea: string;
  count: number;
}

export interface LawyerCaseAggregate {
  userId: string;
  totalCases: number;
  closedCases: number;
  wonCases: number;
}

const CLOSED_STATUSES: CaseStatus[] = ['CLOSED', 'WON', 'LOST'];

export class DashboardCaseRepository {
  constructor(private readonly db: PrismaClient) {}

  async countByStatuses(workspaceId: string, statuses: CaseStatus[]): Promise<number> {
    if (statuses.length === 0) {
      return 0;
    }
    return this.db.case.count({
      where: { workspaceId, status: { in: statuses } },
    });
  }

  /** Active Cases card — status = ACTIVE only. */
  async countActiveCases(workspaceId: string): Promise<number> {
    return this.countByStatuses(workspaceId, ['ACTIVE']);
  }

  async countOpenCases(workspaceId: string): Promise<number> {
    return this.countByStatuses(workspaceId, ['OPEN']);
  }

  async countPendingCases(workspaceId: string): Promise<number> {
    return this.countByStatuses(workspaceId, ['PENDING']);
  }

  async countDraftCases(workspaceId: string): Promise<number> {
    return this.countByStatuses(workspaceId, ['DRAFT']);
  }

  async countClosedCases(workspaceId: string): Promise<number> {
    return this.countByStatuses(workspaceId, CLOSED_STATUSES);
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
    });
    return decimalToNumber(result._sum.billableHours);
  }

  async countCasesWithBillableHours(workspaceId: string): Promise<number> {
    return this.db.case.count({
      where: { workspaceId, billableHours: { gt: 0 } },
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
    const rows = await this.db.$queryRaw<Array<{ practice_area: string | null; count: bigint }>>`
      SELECT COALESCE(NULLIF(TRIM("practiceArea"), ''), 'Other') AS practice_area,
             COUNT(*)::bigint AS count
      FROM "cases"
      WHERE "workspaceId" = ${workspaceId}
      GROUP BY COALESCE(NULLIF(TRIM("practiceArea"), ''), 'Other')
      ORDER BY count DESC
    `;

    return rows.map((row) => ({
      practiceArea: row.practice_area ?? 'Other',
      count: Number(row.count),
    }));
  }

  /**
   * Per-lawyer case aggregates for team averages (SQL GROUP BY).
   */
  async aggregateByLawyer(workspaceId: string): Promise<LawyerCaseAggregate[]> {
    const rows = await this.db.$queryRaw<
      Array<{ user_id: string; total: bigint; closed: bigint; won: bigint }>
    >`
      SELECT c."assignedToUserId" AS user_id,
             COUNT(*)::bigint AS total,
             COUNT(*) FILTER (
               WHERE c."status" IN ('CLOSED', 'WON', 'LOST')
             )::bigint AS closed,
             COUNT(*) FILTER (WHERE c."status" = 'WON')::bigint AS won
      FROM "cases" c
      INNER JOIN "workspace_members" m
        ON m."workspaceId" = c."workspaceId"
       AND m."userId" = c."assignedToUserId"
       AND m."role" = 'LAWYER'
      WHERE c."workspaceId" = ${workspaceId}
        AND c."assignedToUserId" IS NOT NULL
      GROUP BY c."assignedToUserId"
    `;

    return rows.map((row) => ({
      userId: row.user_id,
      totalCases: Number(row.total),
      closedCases: Number(row.closed),
      wonCases: Number(row.won),
    }));
  }

  async sumBillableHoursInPeriod(
    workspaceId: string,
    period: PeriodBounds,
  ): Promise<number> {
    const result = await this.db.billableHourEntry.aggregate({
      where: {
        workspaceId,
        workedAt: { gte: period.start, lt: period.end },
      },
      _sum: { hours: true },
    });
    return decimalToNumber(result._sum.hours);
  }

  async sumAllBillableHourEntries(workspaceId: string): Promise<number> {
    const result = await this.db.billableHourEntry.aggregate({
      where: { workspaceId },
      _sum: { hours: true },
    });
    return decimalToNumber(result._sum.hours);
  }
}

function decimalToNumber(value: Prisma.Decimal | null | undefined): number {
  if (value == null) {
    return 0;
  }
  return Number(value);
}
