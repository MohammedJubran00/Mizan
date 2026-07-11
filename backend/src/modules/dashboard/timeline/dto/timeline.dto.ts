export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ActivityGroupKey =
  | 'TODAY'
  | 'YESTERDAY'
  | 'EARLIER_THIS_WEEK'
  | 'EARLIER_THIS_MONTH'
  | 'OLDER';

export interface PaginationMetaDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
}

export interface HearingSummaryDto {
  today: number;
  tomorrow: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  rescheduled: number;
  overdue: number;
}

export interface HearingDetailDto {
  id: string;
  caseId: string | null;
  caseNumber: string | null;
  caseTitle: string | null;
  clientName: string | null;
  courtName: string | null;
  location: string | null;
  assignedLawyer: string | null;
  assignedLawyerId: string | null;
  hearingDate: string;
  hearingTime: string;
  scheduledAt: string;
  hearingType: string;
  status: string;
  priority: PriorityLevel;
  daysRemaining: number;
  title: string;
}

export interface HearingsDashboardDto {
  /** Task 2/3 compatibility counts. */
  todayCount: number;
  upcomingCount: number;
  overdueCount: number;
  completedCount: number;
  cancelledCount: number;
  /** Legacy simple items. */
  items: Array<{
    id: string;
    title: string;
    scheduledAt: string;
    status: string;
    location: string | null;
    caseId: string | null;
  }>;
  summary: HearingSummaryDto;
  hearings: HearingDetailDto[];
  pagination: PaginationMetaDto;
}

export interface DeadlineSummaryDto {
  dueToday: number;
  dueTomorrow: number;
  dueThisWeek: number;
  dueThisMonth: number;
  overdue: number;
  completed: number;
  cancelled: number;
  upcoming: number;
}

export interface DeadlineDetailDto {
  id: string;
  caseId: string | null;
  caseNumber: string | null;
  caseTitle: string | null;
  title: string;
  type: string;
  importance: string;
  status: string;
  dueAt: string;
  dueDate: string;
  dueTime: string;
  priority: PriorityLevel;
  daysRemaining: number;
}

export interface DeadlinesDashboardDto {
  todayCount: number;
  upcomingCount: number;
  overdueCount: number;
  completedCount: number;
  windows: {
    within24Hours: number;
    within3Days: number;
    within7Days: number;
    within30Days: number;
  };
  items: Array<{
    id: string;
    title: string;
    dueAt: string;
    status: string;
    caseId: string | null;
  }>;
  summary: DeadlineSummaryDto;
  deadlines: DeadlineDetailDto[];
  pagination: PaginationMetaDto;
}

export interface TimelineActorDto {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export interface TimelineActivityDto {
  id: string;
  workspaceId: string;
  actor: TimelineActorDto | null;
  actorAvatar: string | null;
  action: string;
  type: string;
  targetType: string | null;
  targetId: string | null;
  targetName: string | null;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  timestamp: string;
  relativeTime: string;
  severity: string;
  metadata: Record<string, unknown> | null;
  /** Legacy fields. */
  entityType: string | null;
  entityId: string | null;
  userId: string | null;
  createdAt: string;
}

export interface ActivityGroupDto {
  key: ActivityGroupKey;
  label: string;
  items: TimelineActivityDto[];
}

export interface ActivitiesDashboardDto {
  total: number;
  items: TimelineActivityDto[];
  groups: ActivityGroupDto[];
  pagination: PaginationMetaDto;
}

export type AlertType =
  | 'HEARING_TODAY'
  | 'DEADLINE_TOMORROW'
  | 'CASE_OVERDUE'
  | 'INVOICE_OVERDUE'
  | 'DOCUMENT_REVIEW'
  | 'CLIENT_UNPAID'
  | 'TASK_OVERDUE';

export interface DashboardAlertDto {
  id: string;
  type: AlertType;
  severity: PriorityLevel;
  title: string;
  message: string;
  targetType: string;
  targetId: string | null;
  createdAt: string;
  dismissible: boolean;
}

export interface DashboardAlertsDto {
  total: number;
  criticalCount: number;
  items: DashboardAlertDto[];
}

export interface NotificationSummaryDto {
  unreadNotifications: number;
  criticalNotifications: number;
  upcomingHearings: number;
  urgentDeadlines: number;
  pendingTasks: number;
  unreadMessages: number;
}
