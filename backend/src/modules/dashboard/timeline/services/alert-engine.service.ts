import type { WorkspacePeriods } from '../../../../shared/utils/timezone';
import type { DashboardAlertDto, DashboardAlertsDto } from '../dto/timeline.dto';
import type { TimelineAlertRepository } from '../repositories/timeline-activity-alert.repository';

/**
 * Smart dashboard alerts — disappear automatically when underlying issues resolve
 * because they are recalculated on each request from live data.
 */
export class AlertEngineService {
  constructor(private readonly alertRepository: TimelineAlertRepository) {}

  async calculate(input: {
    workspaceId: string;
    now: Date;
    periods: WorkspacePeriods;
  }): Promise<DashboardAlertsDto> {
    const [
      hearingsToday,
      deadlinesTomorrow,
      overdueCases,
      overdueInvoices,
      unpaidClients,
    ] = await Promise.all([
      this.alertRepository.findHearingsToday(input.workspaceId, input.periods.today),
      this.alertRepository.findDeadlinesTomorrow(
        input.workspaceId,
        input.periods.tomorrow,
      ),
      this.alertRepository.findOverdueCases(input.workspaceId, input.now),
      this.alertRepository.findOverdueInvoices(input.workspaceId),
      this.alertRepository.findClientsWithUnpaidInvoices(input.workspaceId),
    ]);

    const items: DashboardAlertDto[] = [];

    for (const hearing of hearingsToday) {
      items.push({
        id: `hearing-today-${hearing.id}`,
        type: 'HEARING_TODAY',
        severity: 'CRITICAL',
        title: 'Hearing starts today',
        message: `Hearing "${hearing.title}" is scheduled today.`,
        targetType: 'hearing',
        targetId: hearing.id,
        createdAt: input.now.toISOString(),
        dismissible: true,
      });
    }

    for (const deadline of deadlinesTomorrow) {
      items.push({
        id: `deadline-tomorrow-${deadline.id}`,
        type: 'DEADLINE_TOMORROW',
        severity: 'HIGH',
        title: 'Deadline expires tomorrow',
        message: `Deadline "${deadline.title}" is due tomorrow.`,
        targetType: 'deadline',
        targetId: deadline.id,
        createdAt: input.now.toISOString(),
        dismissible: true,
      });
    }

    for (const overdue of overdueCases) {
      items.push({
        id: `case-overdue-${overdue.id}`,
        type: 'CASE_OVERDUE',
        severity: 'CRITICAL',
        title: 'Case deadline overdue',
        message: `Deadline "${overdue.title}" on case "${overdue.case?.title ?? 'Case'}" is overdue.`,
        targetType: 'deadline',
        targetId: overdue.id,
        createdAt: input.now.toISOString(),
        dismissible: true,
      });
    }

    for (const invoice of overdueInvoices) {
      items.push({
        id: `invoice-overdue-${invoice.id}`,
        type: 'INVOICE_OVERDUE',
        severity: 'HIGH',
        title: 'Invoice is overdue',
        message: `An invoice of ${invoice.currency} ${Number(invoice.amount)} is overdue.`,
        targetType: 'invoice',
        targetId: invoice.id,
        createdAt: input.now.toISOString(),
        dismissible: true,
      });
    }

    for (const client of unpaidClients) {
      items.push({
        id: `client-unpaid-${client.clientId}`,
        type: 'CLIENT_UNPAID',
        severity: 'MEDIUM',
        title: 'Client has unpaid invoices',
        message: `${client.clientName} has ${client.unpaidCount} unpaid invoice(s).`,
        targetType: 'client',
        targetId: client.clientId,
        createdAt: input.now.toISOString(),
        dismissible: true,
      });
    }

    // Placeholder hooks for future document/task modules — empty when no data.
    // They will populate automatically once those tables exist and are queried here.

    const criticalCount = items.filter(
      (item) => item.severity === 'CRITICAL' || item.severity === 'HIGH',
    ).length;

    return {
      total: items.length,
      criticalCount,
      items,
    };
  }
}
