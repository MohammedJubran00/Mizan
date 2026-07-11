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

Map<String, dynamic> _asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) {
    return value.map((key, val) => MapEntry(key.toString(), val));
  }
  return const {};
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

PaginationEntity _parsePagination(Map<String, dynamic> json) {
  if (json.isEmpty) {
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
  final actor = _asMap(json['actor']);
  String? actorName;
  if (actor.isNotEmpty) {
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

List<ChartPointEntity> _parseChartPoints(dynamic raw) {
  if (raw is! List) return const [];
  final points = <ChartPointEntity>[];
  for (final item in raw) {
    if (item is! Map) continue;
    final map = _asMap(item);
    points.add(
      ChartPointEntity(
        label: _asString(map['label'] ?? map['month'] ?? map['name']),
        value: _asDouble(map['value'] ?? map['amount'] ?? map['revenue']),
        percentage: map.containsKey('percentage')
            ? _asDouble(map['percentage'])
            : null,
        secondaryValue: map.containsKey('secondaryValue')
            ? _asDouble(map['secondaryValue'])
            : null,
        stackKey: map['stackKey'] as String?,
      ),
    );
  }
  return points;
}

List<CaseMixSliceEntity> _parseCaseMixSlices(dynamic raw) {
  if (raw is! List) return const [];
  final slices = <CaseMixSliceEntity>[];
  for (final item in raw) {
    if (item is! Map) continue;
    final map = _asMap(item);
    slices.add(
      CaseMixSliceEntity(
        label: _asString(map['label']),
        value: _asDouble(map['value']),
        percentage: _asDouble(map['percentage']),
      ),
    );
  }
  return slices;
}

RevenueGrowthMetricEntity _parseGrowthMetric(Map<String, dynamic> json) {
  if (json.isEmpty) {
    return const RevenueGrowthMetricEntity(
      currentValue: 0,
      previousValue: 0,
      percentage: 0,
      direction: 'NO_CHANGE',
    );
  }
  return RevenueGrowthMetricEntity(
    currentValue: _asDouble(json['currentValue']),
    previousValue: _asDouble(json['previousValue']),
    percentage: _asDouble(json['percentage']),
    direction: _asString(json['direction'], 'NO_CHANGE'),
  );
}

ChartSeriesEntity _parseChartSeries(
  Map<String, dynamic>? json, {
  required String fallbackId,
  required String fallbackName,
  required String fallbackType,
}) {
  if (json == null) {
    return ChartSeriesEntity(
      id: fallbackId,
      name: fallbackName,
      chartType: fallbackType,
      points: const [],
    );
  }
  return ChartSeriesEntity(
    id: _asString(json['id'], fallbackId),
    name: _asString(json['name'], fallbackName),
    chartType: _asString(json['chartType'], fallbackType),
    points: _parseChartPoints(json['points']),
    currency: json['currency'] as String?,
  );
}

List<MonthlyRevenueEntity> _parseTrend(dynamic raw) {
  if (raw is! List) return const [];
  final months = <MonthlyRevenueEntity>[];
  for (final item in raw) {
    if (item is! Map) continue;
    final map = _asMap(item);
    months.add(
      MonthlyRevenueEntity(
        month: _asInt(map['month']),
        year: _asInt(map['year']),
        label: _asString(map['label']),
        revenue: _asDouble(map['revenue']),
        growth: _asDouble(map['growth']),
        invoiceCount: _asInt(map['invoiceCount']),
        paymentCount: _asInt(map['paymentCount']),
        currency: _asString(map['currency'], 'USD'),
      ),
    );
  }
  return months;
}

List<RevenueSourceEntity> _parseBreakdown(dynamic raw) {
  if (raw is! List) return const [];
  final items = <RevenueSourceEntity>[];
  for (final item in raw) {
    if (item is! Map) continue;
    final map = _asMap(item);
    items.add(
      RevenueSourceEntity(
        key: _asString(map['key']),
        label: _asString(map['label']),
        amount: _asDouble(map['amount']),
        percentage: _asDouble(map['percentage']),
        currency: _asString(map['currency'], 'USD'),
      ),
    );
  }
  return items;
}

FinancialKpisEntity _parseKpis(Map<String, dynamic> json, String currency) {
  if (json.isEmpty) {
    return FinancialKpisEntity(
      averageInvoiceValue: 0,
      averageRevenuePerClient: 0,
      averageRevenuePerCase: 0,
      revenuePerLawyer: 0,
      revenuePerMonth: 0,
      collectionRate: 0,
      paymentSuccessRate: 0,
      outstandingBalance: 0,
      averagePaymentDelayDays: 0,
      currency: currency,
    );
  }
  return FinancialKpisEntity(
    averageInvoiceValue: _asDouble(json['averageInvoiceValue']),
    averageRevenuePerClient: _asDouble(json['averageRevenuePerClient']),
    averageRevenuePerCase: _asDouble(json['averageRevenuePerCase']),
    revenuePerLawyer: _asDouble(json['revenuePerLawyer']),
    revenuePerMonth: _asDouble(json['revenuePerMonth']),
    collectionRate: _asDouble(json['collectionRate']),
    paymentSuccessRate: _asDouble(json['paymentSuccessRate']),
    outstandingBalance: _asDouble(json['outstandingBalance']),
    averagePaymentDelayDays: _asDouble(json['averagePaymentDelayDays']),
    currency: _asString(json['currency'], currency),
  );
}

DashboardChartsEntity _parseCharts({
  required Map<String, dynamic> chartsJson,
  required Map<String, dynamic> caseMixJson,
  required Map<String, dynamic> revenueJson,
  required Map<String, dynamic> teamJson,
  required Map<String, dynamic> hearingsJson,
  required Map<String, dynamic> activitiesJson,
}) {
  final currency = _asString(
    revenueJson['currency'] ?? revenueJson['defaultCurrency'],
    'USD',
  );
  final summary = _asMap(revenueJson['summary']);
  final comparisons = _asMap(revenueJson['comparisons']);
  final breakdownJson = _asMap(revenueJson['breakdown']);
  final chartsEngine = _asMap(revenueJson['charts']);
  final trendJson = _asMap(revenueJson['trend']);
  final roles = _asMap(teamJson['roles']);
  final hearingSummary = _asMap(hearingsJson['summary']);

  final roleSeries = <ChartPointEntity>[];
  final byRole = roles['byRole'];
  if (byRole is Map) {
    byRole.forEach((key, value) {
      roleSeries.add(
        ChartPointEntity(label: _asString(key), value: _asDouble(value)),
      );
    });
  } else {
    void addRole(String label, dynamic value) {
      final n = _asDouble(value);
      if (n > 0) roleSeries.add(ChartPointEntity(label: label, value: n));
    }

    addRole('Lawyers', roles['lawyers']);
    addRole('Assistants', roles['assistants']);
    addRole('Admins', roles['admins']);
    addRole('Owners', roles['owners']);
    addRole('Members', roles['members']);
  }

  final hearingDistribution = <ChartPointEntity>[
    ChartPointEntity(
      label: 'Today',
      value: _asDouble(hearingSummary['today'] ?? hearingsJson['todayCount']),
    ),
    ChartPointEntity(
      label: 'Upcoming',
      value: _asDouble(
        hearingSummary['upcoming'] ?? hearingsJson['upcomingCount'],
      ),
    ),
    ChartPointEntity(
      label: 'Overdue',
      value: _asDouble(
        hearingSummary['overdue'] ?? hearingsJson['overdueCount'],
      ),
    ),
    ChartPointEntity(
      label: 'Completed',
      value: _asDouble(
        hearingSummary['completed'] ?? hearingsJson['completedCount'],
      ),
    ),
    ChartPointEntity(
      label: 'Cancelled',
      value: _asDouble(
        hearingSummary['cancelled'] ?? hearingsJson['cancelledCount'],
      ),
    ),
    ChartPointEntity(
      label: 'Rescheduled',
      value: _asDouble(hearingSummary['rescheduled']),
    ),
  ].where((p) => p.value > 0).toList();

  final billingStatistics = <ChartPointEntity>[
    ChartPointEntity(
      label: 'Paid',
      value: _asDouble(summary['paid'] ?? revenueJson['paid']),
    ),
    ChartPointEntity(
      label: 'Outstanding',
      value: _asDouble(summary['outstanding'] ?? revenueJson['outstanding']),
    ),
    ChartPointEntity(
      label: 'Pending',
      value: _asDouble(summary['pending']),
    ),
    ChartPointEntity(
      label: 'Cancelled',
      value: _asDouble(summary['cancelled']),
    ),
    ChartPointEntity(
      label: 'Refunded',
      value: _asDouble(summary['refunded']),
    ),
  ].where((p) => p.value > 0).toList();

  // Prefer engine line points; fall back to byMonth / trend months.
  var revenueByMonth = _parseChartPoints(_asMap(chartsEngine['line'])['points']);
  if (revenueByMonth.isEmpty) {
    revenueByMonth = _parseChartPoints(revenueJson['byMonth']);
  }
  if (revenueByMonth.isEmpty) {
    revenueByMonth = _parseTrend(trendJson['months'])
        .map(
          (m) => ChartPointEntity(label: m.label, value: m.revenue),
        )
        .toList();
  }
  if (revenueByMonth.isEmpty) {
    revenueByMonth = _parseChartPoints(chartsJson['revenueByMonth']);
  }

  final activityTotal = _asInt(activitiesJson['total']);
  final monthlyActivity = <ChartPointEntity>[
    if (activityTotal > 0)
      ChartPointEntity(label: 'Recent', value: activityTotal.toDouble()),
  ];

  final casesByStatus = _parseChartPoints(chartsJson['casesByStatus']);
  final caseMixByPractice =
      _parseChartPoints(chartsJson['caseMixByPracticeArea']);

  final lineChart = _parseChartSeries(
    chartsEngine['line'] == null ? null : _asMap(chartsEngine['line']),
    fallbackId: 'revenue-line',
    fallbackName: 'Revenue Trend',
    fallbackType: 'line',
  );
  final areaChart = _parseChartSeries(
    chartsEngine['area'] == null ? null : _asMap(chartsEngine['area']),
    fallbackId: 'revenue-area',
    fallbackName: 'Revenue Area',
    fallbackType: 'area',
  );
  final barChart = _parseChartSeries(
    chartsEngine['bar'] == null ? null : _asMap(chartsEngine['bar']),
    fallbackId: 'revenue-bar',
    fallbackName: 'Monthly Revenue',
    fallbackType: 'bar',
  );
  final pieChart = _parseChartSeries(
    chartsEngine['pie'] == null ? null : _asMap(chartsEngine['pie']),
    fallbackId: 'revenue-pie',
    fallbackName: 'Revenue by Category',
    fallbackType: 'pie',
  );

  return DashboardChartsEntity(
    casesByStatus: casesByStatus.isNotEmpty
        ? casesByStatus
        : _parseCaseMixSlices(caseMixJson['byStatus'])
            .map(
              (s) => ChartPointEntity(
                label: s.label,
                value: s.value,
                percentage: s.percentage,
              ),
            )
            .toList(),
    revenueByMonth: revenueByMonth,
    caseMixByPracticeArea: caseMixByPractice.isNotEmpty
        ? caseMixByPractice
        : _parseCaseMixSlices(caseMixJson['byPracticeArea'])
            .map(
              (s) => ChartPointEntity(
                label: s.label,
                value: s.value,
                percentage: s.percentage,
              ),
            )
            .toList(),
    hearingDistribution: hearingDistribution,
    billingStatistics: billingStatistics,
    monthlyActivity: monthlyActivity,
    caseMix: CaseMixEntity(
      byStatus: _parseCaseMixSlices(caseMixJson['byStatus']),
      byPracticeArea: _parseCaseMixSlices(caseMixJson['byPracticeArea']),
    ),
    revenue: RevenueAnalyticsEntity(
      currency: currency,
      summaryPaid: _asDouble(summary['paid'] ?? revenueJson['paid']),
      summaryOutstanding:
          _asDouble(summary['outstanding'] ?? revenueJson['outstanding']),
      trend: _parseTrend(trendJson['months']),
      monthOverMonth: _parseGrowthMetric(_asMap(comparisons['monthOverMonth'])),
      weekOverWeek: _parseGrowthMetric(_asMap(comparisons['weekOverWeek'])),
      quarterOverQuarter:
          _parseGrowthMetric(_asMap(comparisons['quarterOverQuarter'])),
      yearOverYear: _parseGrowthMetric(_asMap(comparisons['yearOverYear'])),
      breakdown: _parseBreakdown(breakdownJson['items']),
      kpis: _parseKpis(_asMap(revenueJson['kpis']), currency),
      lineChart: lineChart.points.isNotEmpty
          ? lineChart
          : ChartSeriesEntity(
              id: 'revenue-line',
              name: 'Revenue Trend',
              chartType: 'line',
              points: revenueByMonth,
              currency: currency,
            ),
      areaChart: areaChart.points.isNotEmpty
          ? areaChart
          : ChartSeriesEntity(
              id: 'revenue-area',
              name: 'Revenue Area',
              chartType: 'area',
              points: revenueByMonth,
              currency: currency,
            ),
      barChart: barChart.points.isNotEmpty
          ? barChart
          : ChartSeriesEntity(
              id: 'revenue-bar',
              name: 'Monthly Revenue',
              chartType: 'bar',
              points: revenueByMonth,
              currency: currency,
            ),
      pieChart: pieChart.points.isNotEmpty
          ? pieChart
          : ChartSeriesEntity(
              id: 'revenue-pie',
              name: 'Revenue by Category',
              chartType: 'pie',
              points: _parseBreakdown(breakdownJson['items'])
                  .map(
                    (s) => ChartPointEntity(
                      label: s.label,
                      value: s.amount,
                      percentage: s.percentage,
                    ),
                  )
                  .toList(),
              currency: currency,
            ),
    ),
    team: TeamPerformanceEntity(
      totalUsers: _asInt(teamJson['totalUsers']),
      activeUsers: _asInt(teamJson['activeUsers']),
      lawyers: _asInt(roles['lawyers']),
      assistants: _asInt(roles['assistants']),
      admins: _asInt(roles['admins']),
      averageCasesPerLawyer: _asDouble(teamJson['averageCasesPerLawyer']),
      averageClosedCases: _asDouble(teamJson['averageClosedCases']),
      averageWinRate: _asDouble(teamJson['averageWinRate']),
      roleSeries: roleSeries,
    ),
  );
}

class DashboardModel {
  const DashboardModel(this.entity);

  final DashboardEntity entity;

  factory DashboardModel.fromJson(Map<String, dynamic> json) {
    final greetingJson = _asMap(json['greeting']);
    final userJson = _asMap(json['user']);
    final workspaceJson = _asMap(json['workspace']);
    final overviewJson = _asMap(json['overview']);
    final revenueJson = _asMap(json['revenue']);
    final hearingsJson = _asMap(json['hearings']);
    final deadlinesJson = _asMap(json['deadlines']);
    final activitiesJson = _asMap(json['activities']);
    final notificationsJson = _asMap(json['notifications']);
    final teamJson = _asMap(json['team']);
    final chartsJson = _asMap(json['charts']);
    final caseMixJson = _asMap(json['caseMix']);
    final charts = _parseCharts(
      chartsJson: chartsJson,
      caseMixJson: caseMixJson,
      revenueJson: revenueJson,
      teamJson: teamJson,
      hearingsJson: hearingsJson,
      activitiesJson: activitiesJson,
    );

    final activeCases = _asMap(overviewJson['activeCases']);
    final revenueCard = _asMap(overviewJson['revenue']);
    final winRate = _asMap(overviewJson['winRate']);
    final billable = _asMap(overviewJson['billableHours']);
    final clients = _asMap(overviewJson['clients']);
    final comparisons = _asMap(revenueJson['comparisons']);
    final mom = _asMap(comparisons['monthOverMonth']);
    final currency = _asString(
      revenueCard['currency'] ?? revenueJson['currency'],
      'USD',
    );

    final hearingList = <HearingEntity>[];
    final hearingsRaw = hearingsJson['hearings'];
    if (hearingsRaw is List) {
      for (final item in hearingsRaw) {
        if (item is Map) {
          hearingList.add(_parseHearing(_asMap(item)));
        }
      }
    }

    final deadlineList = <DeadlineEntity>[];
    final deadlinesRaw = deadlinesJson['deadlines'];
    if (deadlinesRaw is List) {
      for (final item in deadlinesRaw) {
        if (item is Map) {
          deadlineList.add(_parseDeadline(_asMap(item)));
        }
      }
    }

    final groups = <ActivityGroupEntity>[];
    final groupsRaw = activitiesJson['groups'];
    if (groupsRaw is List) {
      for (final g in groupsRaw) {
        if (g is! Map) continue;
        final groupMap = _asMap(g);
        final itemsRaw = groupMap['items'];
        final items = <ActivityEntity>[];
        if (itemsRaw is List) {
          for (final item in itemsRaw) {
            if (item is Map) {
              items.add(_parseActivity(_asMap(item)));
            }
          }
        }
        groups.add(
          ActivityGroupEntity(
            key: _asString(groupMap['key']),
            label: _asString(groupMap['label']),
            items: items,
          ),
        );
      }
    } else {
      final itemsRaw = activitiesJson['items'];
      if (itemsRaw is List && itemsRaw.isNotEmpty) {
        final items = <ActivityEntity>[];
        for (final item in itemsRaw) {
          if (item is Map) {
            items.add(_parseActivity(_asMap(item)));
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
          _asMap(activitiesJson['pagination']),
        ),
        notifications: NotificationSummaryEntity(
          unreadNotifications: _asInt(notificationsJson['unreadNotifications']),
          criticalNotifications:
              _asInt(notificationsJson['criticalNotifications']),
          upcomingHearings: _asInt(notificationsJson['upcomingHearings']),
          urgentDeadlines: _asInt(notificationsJson['urgentDeadlines']),
        ),
        formattedDate: _formatDisplayDate(serverTime),
        charts: charts,
      ),
    );
  }
}
