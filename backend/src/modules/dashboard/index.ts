import { prisma } from '../../config/prisma';
import { PassthroughDashboardCache } from './cache/dashboard-cache';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardAggregator } from './aggregation/dashboard-aggregator';
import { DashboardMapper } from './mapper/dashboard.mapper';
import { DashboardActivityRepository } from './repositories/dashboard-activity.repository';
import { DashboardCaseRepository } from './repositories/dashboard-case.repository';
import { DashboardClientRepository } from './repositories/dashboard-client.repository';
import { DashboardDeadlineRepository } from './repositories/dashboard-deadline.repository';
import { DashboardHearingRepository } from './repositories/dashboard-hearing.repository';
import { DashboardInvoiceRepository } from './repositories/dashboard-invoice.repository';
import { DashboardTeamRepository } from './repositories/dashboard-team.repository';
import { createDashboardRouter } from './routes/dashboard.routes';
import { DashboardService } from './services/dashboard.service';
import { ActivityStatisticsService } from './statistics/activity-statistics.service';
import { CaseStatisticsService } from './statistics/case-statistics.service';
import { DashboardStatisticsService } from './statistics/dashboard-statistics.service';
import { DeadlineStatisticsService } from './statistics/deadline-statistics.service';
import { GreetingService } from './statistics/greeting.service';
import { HearingStatisticsService } from './statistics/hearing-statistics.service';
import { RevenueStatisticsService } from './statistics/revenue-statistics.service';
import { TeamStatisticsService } from './statistics/team-statistics.service';

export function buildDashboardModule() {
  const caseRepository = new DashboardCaseRepository(prisma);
  const clientRepository = new DashboardClientRepository(prisma);
  const hearingRepository = new DashboardHearingRepository(prisma);
  const deadlineRepository = new DashboardDeadlineRepository(prisma);
  const invoiceRepository = new DashboardInvoiceRepository(prisma);
  const activityRepository = new DashboardActivityRepository(prisma);
  const teamRepository = new DashboardTeamRepository(prisma);

  const caseStatistics = new CaseStatisticsService(caseRepository, clientRepository);
  const revenueStatistics = new RevenueStatisticsService(invoiceRepository);
  const hearingStatistics = new HearingStatisticsService(hearingRepository);
  const deadlineStatistics = new DeadlineStatisticsService(deadlineRepository);
  const activityStatistics = new ActivityStatisticsService(activityRepository);
  const teamStatistics = new TeamStatisticsService(teamRepository);

  const dashboardStatistics = new DashboardStatisticsService(
    caseStatistics,
    revenueStatistics,
    hearingStatistics,
    deadlineStatistics,
    activityStatistics,
    teamStatistics,
  );

  const greetingService = new GreetingService();
  const aggregator = new DashboardAggregator(dashboardStatistics);
  const mapper = new DashboardMapper();
  const cache = new PassthroughDashboardCache();

  const dashboardService = new DashboardService(
    greetingService,
    aggregator,
    mapper,
    cache,
  );

  const dashboardController = new DashboardController(dashboardService);
  const dashboardRouter = createDashboardRouter(dashboardController);

  return { dashboardRouter };
}
