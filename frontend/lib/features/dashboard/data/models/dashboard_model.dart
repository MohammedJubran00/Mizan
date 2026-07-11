import '../../domain/entities/dashboard_entity.dart';

double _asDouble(dynamic value) {
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0;
  return 0;
}

int _asInt(dynamic value) {
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? 0;
  return 0;
}

String _asString(dynamic value, [String fallback = '']) {
  if (value is String) return value;
  if (value == null) return fallback;
  return value.toString();
}

DateTime _asDate(dynamic value) {
  if (value is String && value.isNotEmpty) {
    return DateTime.tryParse(value)?.toLocal() ?? DateTime.now();
  }
  return DateTime.now();
}

String _formatMoney(num amount, String currency) {
  final fixed = amount >= 1000
      ? amount.toStringAsFixed(0)
      : amount.toStringAsFixed(amount.truncateToDouble() == amount ? 0 : 2);
  final withCommas = fixed.replaceAllMapped(
    RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
    (m) => '${m[1]},',
  );
  return '$currency $withCommas';
}

String _formatHours(num hours) {
  if (hours == hours.roundToDouble()) return '${hours.toInt()}h';
  return '${hours.toStringAsFixed(1)}h';
}

String _formatPercent(num value) {
  if (value == value.roundToDouble()) return '${value.toInt()}%';
  return '${value.toStringAsFixed(1)}%';
}

String _formatCount(num value) {
  if (value >= 1000) {
    return value.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]},',
        );
  }
  return value.toStringAsFixed(0);
}

String _formatDisplayDate(DateTime date) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const weekdays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  return '${weekdays[date.weekday - 1]}, ${months[date.month - 1]} ${date.day}, ${date.year}';
}

PaginationEntity _parsePagination(Map<String, dynamic>? json) {
  if (json == null) {
    return const PaginationEntity(
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: false,
    );
  }
  return PaginationEntity(
    page: _asInt(json['page']),
    pageSize: _asInt(json['pageSize']),
    total: _asInt(json['total']),
    hasMore: json['hasMore'] == true,
    nextCursor: json['nextCursor'] as String?,
  );
}

ActivityEntity _parseActivity(Map<String, dynamic> json) {
  final actor = json['actor'];
  String? actorName;
  if (actor is Map<String, dynamic>) {
    actorName = _asString(actor['fullName'], '');
    if (actorName.isEmpty) actorName = null;
  }
  return ActivityEntity(
    id: _asString(json['id']),
    action: _asString(json['action']),
    title: _asString(json['title']),
    description: json['description'] as String?,
    timestamp: _asDate(json['timestamp'] ?? json['createdAt']),
    relativeTime: _asString(json['relativeTime'], ''),
    icon: _asString(json['icon'], 'activity'),
    severity: _asString(json['severity'], 'LOW'),
    actorName: actorName,
    targetName: json['targetName'] as String?,
  );
}

HearingEntity _parseHearing(Map<String, dynamic> json) {
  return HearingEntity(
    id: _asString(json['id']),
    title: _asString(json['title']),
    scheduledAt: _asDate(json['scheduledAt']),
    status: _asString(json['status']),
    priority: _asString(json['priority'], 'MEDIUM'),
    daysRemaining: _asInt(json['daysRemaining']),
    courtName: json['courtName'] as String?,
    caseTitle: json['caseTitle'] as String?,
    caseNumber: json['caseNumber'] as String?,
    clientName: json['clientName'] as String?,
    assignedLawyer: json['assignedLawyer'] as String?,
    location: json['location'] as String?,
    hearingTime: json['hearingTime'] as String?,
  );
}

DeadlineEntity _parseDeadline(Map<String, dynamic> json) {
  return DeadlineEntity(
    id: _asString(json['id']),
    title: _asString(json['title']),
    dueAt: _asDate(json['dueAt']),
    status: _asString(json['status']),
    priority: _asString(json['priority'], 'MEDIUM'),
    daysRemaining: _asInt(json['daysRemaining']),
    caseTitle: json['caseTitle'] as String?,
    caseNumber: json['caseNumber'] as String?,
    type: json['type'] as String?,
  );
}

class DashboardModel {
  const DashboardModel(this.entity);

  final DashboardEntity entity;

  factory DashboardModel.fromJson(Map<String, dynamic> json) {
    final greetingJson = json['greeting'] as Map<String, dynamic>? ?? const {};
    final userJson = json['user'] as Map<String, dynamic>? ?? const {};
    final workspaceJson =
        json['workspace'] as Map<String, dynamic>? ?? const {};
    final overviewJson = json['overview'] as Map<String, dynamic>? ?? const {};
    final revenueJson = json['revenue'] as Map<String, dynamic>? ?? const {};
    final hearingsJson = json['hearings'] as Map<String, dynamic>? ?? const {};
    final deadlinesJson =
        json['deadlines'] as Map<String, dynamic>? ?? const {};
    final activitiesJson =
        json['activities'] as Map<String, dynamic>? ?? const {};
    final notificationsJson =
        json['notifications'] as Map<String, dynamic>? ?? const {};
    final teamJson = json['team'] as Map<String, dynamic>? ?? const {};

    final activeCases =
        overviewJson['activeCases'] as Map<String, dynamic>? ?? const {};
    final revenueCard =
        overviewJson['revenue'] as Map<String, dynamic>? ?? const {};
    final winRate =
        overviewJson['winRate'] as Map<String, dynamic>? ?? const {};
    final billable =
        overviewJson['billableHours'] as Map<String, dynamic>? ?? const {};
    final clients =
        overviewJson['clients'] as Map<String, dynamic>? ?? const {};
    final comparisons =
        revenueJson['comparisons'] as Map<String, dynamic>? ?? const {};
    final mom =
        comparisons['monthOverMonth'] as Map<String, dynamic>? ?? const {};
    final currency = _asString(
      revenueCard['currency'] ?? revenueJson['currency'],
      'USD',
    );

    final hearingList = <HearingEntity>[];
    final hearingsRaw = hearingsJson['hearings'];
    if (hearingsRaw is List) {
      for (final item in hearingsRaw) {
        if (item is Map<String, dynamic>) {
          hearingList.add(_parseHearing(item));
        }
      }
    }

    final deadlineList = <DeadlineEntity>[];
    final deadlinesRaw = deadlinesJson['deadlines'];
    if (deadlinesRaw is List) {
      for (final item in deadlinesRaw) {
        if (item is Map<String, dynamic>) {
          deadlineList.add(_parseDeadline(item));
        }
      }
    }

    final groups = <ActivityGroupEntity>[];
    final groupsRaw = activitiesJson['groups'];
    if (groupsRaw is List) {
      for (final g in groupsRaw) {
        if (g is! Map<String, dynamic>) continue;
        final itemsRaw = g['items'];
        final items = <ActivityEntity>[];
        if (itemsRaw is List) {
          for (final item in itemsRaw) {
            if (item is Map<String, dynamic>) {
              items.add(_parseActivity(item));
            }
          }
        }
        groups.add(
          ActivityGroupEntity(
            key: _asString(g['key']),
            label: _asString(g['label']),
            items: items,
          ),
        );
      }
    } else {
      final itemsRaw = activitiesJson['items'];
      if (itemsRaw is List && itemsRaw.isNotEmpty) {
        final items = <ActivityEntity>[];
        for (final item in itemsRaw) {
          if (item is Map<String, dynamic>) {
            items.add(_parseActivity(item));
          }
        }
        groups.add(
          ActivityGroupEntity(key: 'ALL', label: 'Recent', items: items),
        );
      }
    }

    final serverTime = _asDate(greetingJson['serverTime'] ?? json['generatedAt']);
    final growthDirection = _asString(mom['direction'], '');
    final growthPercent =
        mom.isEmpty ? null : _asDouble(mom['percentage']);

    final overview = OverviewEntity(
      activeCases: StatCardEntity(
        title: 'Active Cases',
        value: _formatCount(_asInt(activeCases['active'])),
        subtitle: '${_formatCount(_asInt(activeCases['total']))} total',
        trendLabel: activeCases['trendLabel'] as String?,
      ),
      openCases: StatCardEntity(
        title: 'Open Cases',
        value: _formatCount(_asInt(activeCases['open'])),
        subtitle: '${_formatCount(_asInt(activeCases['pending']))} pending',
        trendLabel: activeCases['trendLabel'] as String?,
      ),
      revenue: StatCardEntity(
        title: 'Revenue',
        value: _formatMoney(_asDouble(revenueCard['totalPaid']), currency),
        subtitle:
            '${_formatCount(_asInt(revenueCard['paidInvoiceCount']))} paid invoices',
        trendLabel: revenueCard['trendLabel'] as String?,
        growthPercent: growthPercent,
        growthDirection: growthDirection.isEmpty ? null : growthDirection,
      ),
      winRate: StatCardEntity(
        title: 'Win Rate',
        value: _formatPercent(_asDouble(winRate['winRate'])),
        subtitle:
            '${_formatCount(_asInt(winRate['won']))} won / ${_formatCount(_asInt(winRate['closed']))} closed',
        trendLabel: winRate['trendLabel'] as String?,
      ),
      billableHours: StatCardEntity(
        title: 'Billable Hours',
        value: _formatHours(_asDouble(billable['totalHours'])),
        subtitle:
            'Avg ${_formatHours(_asDouble(billable['averagePerCase']))} / case',
        trendLabel: billable['trendLabel'] as String?,
      ),
      clients: StatCardEntity(
        title: 'Clients',
        value: _formatCount(_asInt(clients['total'])),
        subtitle:
            '${_formatCount(_asInt(clients['newThisMonth']))} new this month',
        trendLabel: clients['trendLabel'] as String?,
      ),
      teamMembers: StatCardEntity(
        title: 'Team Members',
        value: _formatCount(_asInt(teamJson['activeUsers'] ?? teamJson['memberCount'])),
        subtitle: '${_formatCount(_asInt(teamJson['totalUsers']))} total',
      ),
      invoices: StatCardEntity(
        title: 'Invoices',
        value: _formatCount(_asInt(revenueCard['invoiceCount'])),
        subtitle: _formatMoney(
          _asDouble(revenueCard['outstanding']),
          currency,
        ),
        trendLabel: 'Outstanding',
      ),
      upcomingHearings: StatCardEntity(
        title: 'Upcoming Hearings',
        value: _formatCount(_asInt(hearingsJson['upcomingCount'])),
        subtitle: '${_formatCount(_asInt(hearingsJson['todayCount']))} today',
      ),
      deadlines: StatCardEntity(
        title: 'Deadlines',
        value: _formatCount(_asInt(deadlinesJson['upcomingCount'])),
        subtitle: '${_formatCount(_asInt(deadlinesJson['overdueCount']))} overdue',
      ),
    );

    return DashboardModel(
      DashboardEntity(
        generatedAt: _asDate(json['generatedAt']),
        greeting: GreetingEntity(
          message: _asString(greetingJson['message']),
          period: _asString(greetingJson['period'], 'morning'),
          firstName: _asString(greetingJson['firstName']),
          serverTime: serverTime,
          timezone: _asString(greetingJson['timezone'], 'UTC'),
        ),
        user: DashboardUserEntity(
          id: _asString(userJson['id']),
          fullName: _asString(userJson['fullName']),
          email: _asString(userJson['email']),
          firstName: _asString(userJson['firstName']),
        ),
        workspace: DashboardWorkspaceEntity(
          id: _asString(workspaceJson['id']),
          role: _asString(workspaceJson['role']),
          timezone: _asString(workspaceJson['timezone'], 'UTC'),
          name: workspaceJson['name'] as String?,
        ),
        overview: overview,
        hearings: hearingList,
        deadlines: deadlineList,
        activityGroups: groups,
        activitiesPagination: _parsePagination(
          activitiesJson['pagination'] as Map<String, dynamic>?,
        ),
        notifications: NotificationSummaryEntity(
          unreadNotifications: _asInt(notificationsJson['unreadNotifications']),
          criticalNotifications:
              _asInt(notificationsJson['criticalNotifications']),
          upcomingHearings: _asInt(notificationsJson['upcomingHearings']),
          urgentDeadlines: _asInt(notificationsJson['urgentDeadlines']),
        ),
        formattedDate: _formatDisplayDate(serverTime),
      ),
    );
  }
}
