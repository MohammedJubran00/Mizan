import { prisma } from '../../config/prisma';
import { CacheInvalidator } from '../../shared/cache/cache-invalidator';
import { MemorySmartCache } from '../../shared/cache/memory-smart-cache';
import { SmartDashboardCache } from './cache/dashboard-cache';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardAggregator } from './aggregation/dashboard-aggregator';
import { DashboardMapper } from './mapper/dashboard.mapper';
import { DashboardActivityRepository } from './repositories/dashboard-activity.repository';
import {
  DashboardBillingRepository,
  DashboardInvoiceRepository,
} from './repositories/dashboard-billing.repository';
import { DashboardCaseRepository } from './repositories/dashboard-case.repository';
import { DashboardClientRepository } from './repositories/dashboard-client.repository';
import { DashboardTeamRepository } from './repositories/dashboard-team.repository';
import { RevenueAnalyticsRepository } from './revenue/repositories/revenue-analytics.repository';
import { RevenueAnalyticsService } from './revenue/services/revenue-analytics.service';
import { createDashboardRouter } from './routes/dashboard.routes';
import { BillingService } from './services/billing.service';
import { DashboardService } from './services/dashboard.service';
import { ActivityEngineService } from './statistics/activity-engine.service';
import { CaseStatisticsService } from './statistics/case-statistics.service';
import { ClientStatisticsService } from './statistics/client-statistics.service';
import { DashboardStatisticsService } from './statistics/dashboard-statistics.service';
import { GreetingService } from './statistics/greeting.service';
import { RevenueStatisticsService } from './statistics/revenue-statistics.service';
import { TeamStatisticsService } from './statistics/team-statistics.service';
import { TimelineActivityRepository } from './timeline/repositories/timeline-activity-alert.repository';
import { TimelineAlertRepository } from './timeline/repositories/timeline-activity-alert.repository';
import {
  TimelineDeadlineRepository,
  TimelineHearingRepository,
} from './timeline/repositories/timeline-hearing-deadline.repository';
import { ActivityTimelineService } from './timeline/services/activity-timeline.service';
import { AlertEngineService } from './timeline/services/alert-engine.service';
import { DeadlineEngineService } from './timeline/services/deadline-engine.service';
import { HearingEngineService } from './timeline/services/hearing-engine.service';
import { NotificationSummaryService } from './timeline/services/notification-summary.service';
import { PriorityCalculationService } from './timeline/services/priority-calculation.service';
import { TimelineOrchestratorService } from './timeline/services/timeline-orchestrator.service';

/** Shared Smart Cache instance for the process (workspace-isolated entries). */
const sharedSmartCache = new MemorySmartCache({ maxEntries: 5_000 });

export function buildDashboardModule() {
  const caseRepository = new DashboardCaseRepository(prisma);
  const clientRepository = new DashboardClientRepository(prisma);
  const activityRepository = new DashboardActivityRepository(prisma);
  const teamRepository = new DashboardTeamRepository(prisma);
  const billingRepository = new DashboardBillingRepository(prisma);
  const invoiceRepository = new DashboardInvoiceRepository(prisma);
  const revenueAnalyticsRepository = new RevenueAnalyticsRepository(prisma);

  const timelineHearingRepository = new TimelineHearingRepository(prisma);
  const timelineDeadlineRepository = new TimelineDeadlineRepository(prisma);
  const timelineActivityRepository = new TimelineActivityRepository(prisma);
  const timelineAlertRepository = new TimelineAlertRepository(prisma);

  const cacheInvalidator = new CacheInvalidator(sharedSmartCache);
  const activityEngine = new ActivityEngineService(
    activityRepository,
    cacheInvalidator,
  );
  const billingService = new BillingService(
    prisma,
    activityEngine,
    cacheInvalidator,
  );
  const revenueAnalyticsService = new RevenueAnalyticsService(
    revenueAnalyticsRepository,
  );

  const priorityService = new PriorityCalculationService();
  const hearingEngine = new HearingEngineService(
    timelineHearingRepository,
    priorityService,
  );
  const deadlineEngine = new DeadlineEngineService(
    timelineDeadlineRepository,
    priorityService,
  );
  const activityTimeline = new ActivityTimelineService(timelineActivityRepository);
  const alertEngine = new AlertEngineService(timelineAlertRepository);
  const notificationSummary = new NotificationSummaryService(
    timelineHearingRepository,
    timelineDeadlineRepository,
    timelineAlertRepository,
  );
  const timelineOrchestrator = new TimelineOrchestratorService(
    hearingEngine,
    deadlineEngine,
    activityTimeline,
    alertEngine,
    notificationSummary,
  );

  const caseStatistics = new CaseStatisticsService(caseRepository);
  const clientStatistics = new ClientStatisticsService(clientRepository);
  const revenueStatistics = new RevenueStatisticsService(revenueAnalyticsService);
  const teamStatistics = new TeamStatisticsService(teamRepository, caseRepository);

  const dashboardStatistics = new DashboardStatisticsService(
    caseStatistics,
    clientStatistics,
    revenueStatistics,
    timelineOrchestrator,
    teamStatistics,
  );

  const greetingService = new GreetingService();
  const aggregator = new DashboardAggregator(dashboardStatistics);
  const mapper = new DashboardMapper();
  const cache = new SmartDashboardCache(sharedSmartCache);

  const dashboardService = new DashboardService(
    greetingService,
    aggregator,
    mapper,
    cache,
  );

  const dashboardController = new DashboardController(dashboardService);
  const dashboardRouter = createDashboardRouter(dashboardController);

  return {
    dashboardRouter,
    billingService,
    activityEngine,
    revenueAnalyticsService,
    timelineOrchestrator,
    billingRepository,
    invoiceRepository,
    cacheInvalidator,
    smartCache: sharedSmartCache,
  };
}
