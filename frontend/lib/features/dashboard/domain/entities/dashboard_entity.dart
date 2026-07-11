import 'package:equatable/equatable.dart';

class GreetingEntity extends Equatable {
  const GreetingEntity({
    required this.message,
    required this.period,
    required this.firstName,
    required this.serverTime,
    required this.timezone,
  });

  final String message;
  final String period;
  final String firstName;
  final DateTime serverTime;
  final String timezone;

  @override
  List<Object?> get props => [message, period, firstName, serverTime, timezone];
}

class DashboardUserEntity extends Equatable {
  const DashboardUserEntity({
    required this.id,
    required this.fullName,
    required this.email,
    required this.firstName,
  });

  final String id;
  final String fullName;
  final String email;
  final String firstName;

  @override
  List<Object?> get props => [id, fullName, email, firstName];
}

class DashboardWorkspaceEntity extends Equatable {
  const DashboardWorkspaceEntity({
    required this.id,
    required this.role,
    required this.timezone,
    this.name,
  });

  final String id;
  final String role;
  final String timezone;
  final String? name;

  @override
  List<Object?> get props => [id, role, timezone, name];
}

class StatCardEntity extends Equatable {
  const StatCardEntity({
    required this.title,
    required this.value,
    required this.subtitle,
    this.trendLabel,
    this.growthPercent,
    this.growthDirection,
  });

  final String title;
  final String value;
  final String subtitle;
  final String? trendLabel;
  final double? growthPercent;
  final String? growthDirection;

  @override
  List<Object?> get props =>
      [title, value, subtitle, trendLabel, growthPercent, growthDirection];
}

class OverviewEntity extends Equatable {
  const OverviewEntity({
    required this.activeCases,
    required this.openCases,
    required this.revenue,
    required this.winRate,
    required this.billableHours,
    required this.clients,
    required this.teamMembers,
    required this.invoices,
    required this.upcomingHearings,
    required this.deadlines,
  });

  final StatCardEntity activeCases;
  final StatCardEntity openCases;
  final StatCardEntity revenue;
  final StatCardEntity winRate;
  final StatCardEntity billableHours;
  final StatCardEntity clients;
  final StatCardEntity teamMembers;
  final StatCardEntity invoices;
  final StatCardEntity upcomingHearings;
  final StatCardEntity deadlines;

  List<StatCardEntity> get cards => [
        activeCases,
        openCases,
        revenue,
        upcomingHearings,
        deadlines,
        clients,
        invoices,
        winRate,
        billableHours,
        teamMembers,
      ];

  @override
  List<Object?> get props => cards;
}

class HearingEntity extends Equatable {
  const HearingEntity({
    required this.id,
    required this.title,
    required this.scheduledAt,
    required this.status,
    required this.priority,
    required this.daysRemaining,
    this.courtName,
    this.caseTitle,
    this.caseNumber,
    this.clientName,
    this.assignedLawyer,
    this.location,
    this.hearingTime,
  });

  final String id;
  final String title;
  final DateTime scheduledAt;
  final String status;
  final String priority;
  final int daysRemaining;
  final String? courtName;
  final String? caseTitle;
  final String? caseNumber;
  final String? clientName;
  final String? assignedLawyer;
  final String? location;
  final String? hearingTime;

  @override
  List<Object?> get props => [id, title, scheduledAt, status, priority];
}

class DeadlineEntity extends Equatable {
  const DeadlineEntity({
    required this.id,
    required this.title,
    required this.dueAt,
    required this.status,
    required this.priority,
    required this.daysRemaining,
    this.caseTitle,
    this.caseNumber,
    this.type,
  });

  final String id;
  final String title;
  final DateTime dueAt;
  final String status;
  final String priority;
  final int daysRemaining;
  final String? caseTitle;
  final String? caseNumber;
  final String? type;

  bool get isCritical =>
      priority == 'CRITICAL' || daysRemaining < 0 || daysRemaining == 0;

  bool get isCompleted => status.toUpperCase() == 'COMPLETED';

  @override
  List<Object?> get props => [id, title, dueAt, status, priority];
}

class ActivityEntity extends Equatable {
  const ActivityEntity({
    required this.id,
    required this.action,
    required this.title,
    required this.timestamp,
    required this.relativeTime,
    required this.icon,
    required this.severity,
    this.description,
    this.actorName,
    this.targetName,
  });

  final String id;
  final String action;
  final String title;
  final DateTime timestamp;
  final String relativeTime;
  final String icon;
  final String severity;
  final String? description;
  final String? actorName;
  final String? targetName;

  String get initials {
    final name = (actorName ?? title).trim();
    if (name.isEmpty) return '?';
    final parts = name.split(RegExp(r'\s+'));
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  @override
  List<Object?> get props => [id, action, title, timestamp];
}

class ActivityGroupEntity extends Equatable {
  const ActivityGroupEntity({
    required this.key,
    required this.label,
    required this.items,
  });

  final String key;
  final String label;
  final List<ActivityEntity> items;

  @override
  List<Object?> get props => [key, label, items];
}

class NotificationSummaryEntity extends Equatable {
  const NotificationSummaryEntity({
    required this.unreadNotifications,
    required this.criticalNotifications,
    required this.upcomingHearings,
    required this.urgentDeadlines,
  });

  final int unreadNotifications;
  final int criticalNotifications;
  final int upcomingHearings;
  final int urgentDeadlines;

  @override
  List<Object?> get props => [
        unreadNotifications,
        criticalNotifications,
        upcomingHearings,
        urgentDeadlines,
      ];
}

class PaginationEntity extends Equatable {
  const PaginationEntity({
    required this.page,
    required this.pageSize,
    required this.total,
    required this.hasMore,
    this.nextCursor,
  });

  final int page;
  final int pageSize;
  final int total;
  final bool hasMore;
  final String? nextCursor;

  @override
  List<Object?> get props => [page, pageSize, total, hasMore, nextCursor];
}

class DashboardEntity extends Equatable {
  const DashboardEntity({
    required this.generatedAt,
    required this.greeting,
    required this.user,
    required this.workspace,
    required this.overview,
    required this.hearings,
    required this.deadlines,
    required this.activityGroups,
    required this.activitiesPagination,
    required this.notifications,
    required this.formattedDate,
  });

  final DateTime generatedAt;
  final GreetingEntity greeting;
  final DashboardUserEntity user;
  final DashboardWorkspaceEntity workspace;
  final OverviewEntity overview;
  final List<HearingEntity> hearings;
  final List<DeadlineEntity> deadlines;
  final List<ActivityGroupEntity> activityGroups;
  final PaginationEntity activitiesPagination;
  final NotificationSummaryEntity notifications;
  final String formattedDate;

  @override
  List<Object?> get props => [generatedAt, greeting, overview];
}
