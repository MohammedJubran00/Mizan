import 'package:equatable/equatable.dart';

/// Single chart point — already calculated by the backend.
class ChartPointEntity extends Equatable {
  const ChartPointEntity({
    required this.label,
    required this.value,
    this.percentage,
    this.secondaryValue,
    this.stackKey,
  });

  final String label;
  final double value;
  final double? percentage;
  final double? secondaryValue;
  final String? stackKey;

  @override
  List<Object?> get props => [label, value, percentage, secondaryValue, stackKey];
}

/// Ready-to-render chart series from the backend chart engine.
class ChartSeriesEntity extends Equatable {
  const ChartSeriesEntity({
    required this.id,
    required this.name,
    required this.chartType,
    required this.points,
    this.currency,
  });

  final String id;
  final String name;

  /// line | area | bar | stackedBar | pie | heatmap
  final String chartType;
  final List<ChartPointEntity> points;
  final String? currency;

  bool get isEmpty => points.isEmpty || points.every((p) => p.value == 0);

  @override
  List<Object?> get props => [id, name, chartType, points, currency];
}

class MonthlyRevenueEntity extends Equatable {
  const MonthlyRevenueEntity({
    required this.month,
    required this.year,
    required this.label,
    required this.revenue,
    required this.growth,
    required this.invoiceCount,
    required this.paymentCount,
    required this.currency,
  });

  final int month;
  final int year;
  final String label;
  final double revenue;
  final double growth;
  final int invoiceCount;
  final int paymentCount;
  final String currency;

  @override
  List<Object?> get props =>
      [month, year, label, revenue, growth, invoiceCount, paymentCount];
}

class RevenueGrowthMetricEntity extends Equatable {
  const RevenueGrowthMetricEntity({
    required this.currentValue,
    required this.previousValue,
    required this.percentage,
    required this.direction,
  });

  final double currentValue;
  final double previousValue;
  final double percentage;

  /// INCREASE | DECREASE | NO_CHANGE
  final String direction;

  @override
  List<Object?> get props =>
      [currentValue, previousValue, percentage, direction];
}

class RevenueSourceEntity extends Equatable {
  const RevenueSourceEntity({
    required this.key,
    required this.label,
    required this.amount,
    required this.percentage,
    required this.currency,
  });

  final String key;
  final String label;
  final double amount;
  final double percentage;
  final String currency;

  @override
  List<Object?> get props => [key, label, amount, percentage, currency];
}

class FinancialKpisEntity extends Equatable {
  const FinancialKpisEntity({
    required this.averageInvoiceValue,
    required this.averageRevenuePerClient,
    required this.averageRevenuePerCase,
    required this.revenuePerLawyer,
    required this.revenuePerMonth,
    required this.collectionRate,
    required this.paymentSuccessRate,
    required this.outstandingBalance,
    required this.averagePaymentDelayDays,
    required this.currency,
  });

  final double averageInvoiceValue;
  final double averageRevenuePerClient;
  final double averageRevenuePerCase;
  final double revenuePerLawyer;
  final double revenuePerMonth;
  final double collectionRate;
  final double paymentSuccessRate;
  final double outstandingBalance;
  final double averagePaymentDelayDays;
  final String currency;

  @override
  List<Object?> get props => [
        averageInvoiceValue,
        averageRevenuePerClient,
        averageRevenuePerCase,
        revenuePerLawyer,
        revenuePerMonth,
        collectionRate,
        paymentSuccessRate,
        outstandingBalance,
        averagePaymentDelayDays,
        currency,
      ];
}

class RevenueAnalyticsEntity extends Equatable {
  const RevenueAnalyticsEntity({
    required this.currency,
    required this.summaryPaid,
    required this.summaryOutstanding,
    required this.trend,
    required this.monthOverMonth,
    required this.weekOverWeek,
    required this.quarterOverQuarter,
    required this.yearOverYear,
    required this.breakdown,
    required this.kpis,
    required this.lineChart,
    required this.areaChart,
    required this.barChart,
    required this.pieChart,
  });

  final String currency;
  final double summaryPaid;
  final double summaryOutstanding;
  final List<MonthlyRevenueEntity> trend;
  final RevenueGrowthMetricEntity monthOverMonth;
  final RevenueGrowthMetricEntity weekOverWeek;
  final RevenueGrowthMetricEntity quarterOverQuarter;
  final RevenueGrowthMetricEntity yearOverYear;
  final List<RevenueSourceEntity> breakdown;
  final FinancialKpisEntity kpis;
  final ChartSeriesEntity lineChart;
  final ChartSeriesEntity areaChart;
  final ChartSeriesEntity barChart;
  final ChartSeriesEntity pieChart;

  @override
  List<Object?> get props => [
        currency,
        summaryPaid,
        trend,
        monthOverMonth,
        breakdown,
        kpis,
        lineChart,
        pieChart,
      ];
}

class CaseMixSliceEntity extends Equatable {
  const CaseMixSliceEntity({
    required this.label,
    required this.value,
    required this.percentage,
  });

  final String label;
  final double value;
  final double percentage;

  @override
  List<Object?> get props => [label, value, percentage];
}

class CaseMixEntity extends Equatable {
  const CaseMixEntity({
    required this.byStatus,
    required this.byPracticeArea,
  });

  final List<CaseMixSliceEntity> byStatus;
  final List<CaseMixSliceEntity> byPracticeArea;

  bool get isEmpty => byStatus.isEmpty && byPracticeArea.isEmpty;

  @override
  List<Object?> get props => [byStatus, byPracticeArea];
}

class TeamPerformanceEntity extends Equatable {
  const TeamPerformanceEntity({
    required this.totalUsers,
    required this.activeUsers,
    required this.lawyers,
    required this.assistants,
    required this.admins,
    required this.averageCasesPerLawyer,
    required this.averageClosedCases,
    required this.averageWinRate,
    required this.roleSeries,
  });

  final int totalUsers;
  final int activeUsers;
  final int lawyers;
  final int assistants;
  final int admins;
  final double averageCasesPerLawyer;
  final double averageClosedCases;
  final double averageWinRate;
  final List<ChartPointEntity> roleSeries;

  @override
  List<Object?> get props => [
        totalUsers,
        activeUsers,
        lawyers,
        averageWinRate,
        roleSeries,
      ];
}

/// Aggregated chart datasets for the dashboard — render-only on the client.
class DashboardChartsEntity extends Equatable {
  const DashboardChartsEntity({
    required this.casesByStatus,
    required this.revenueByMonth,
    required this.caseMixByPracticeArea,
    required this.hearingDistribution,
    required this.billingStatistics,
    required this.monthlyActivity,
    required this.caseMix,
    required this.revenue,
    required this.team,
  });

  final List<ChartPointEntity> casesByStatus;
  final List<ChartPointEntity> revenueByMonth;
  final List<ChartPointEntity> caseMixByPracticeArea;
  final List<ChartPointEntity> hearingDistribution;
  final List<ChartPointEntity> billingStatistics;
  final List<ChartPointEntity> monthlyActivity;
  final CaseMixEntity caseMix;
  final RevenueAnalyticsEntity revenue;
  final TeamPerformanceEntity team;

  static DashboardChartsEntity empty() {
    const zeroGrowth = RevenueGrowthMetricEntity(
      currentValue: 0,
      previousValue: 0,
      percentage: 0,
      direction: 'NO_CHANGE',
    );
    const emptySeries = ChartSeriesEntity(
      id: '',
      name: '',
      chartType: 'line',
      points: [],
    );
    return DashboardChartsEntity(
      casesByStatus: const [],
      revenueByMonth: const [],
      caseMixByPracticeArea: const [],
      hearingDistribution: const [],
      billingStatistics: const [],
      monthlyActivity: const [],
      caseMix: const CaseMixEntity(byStatus: [], byPracticeArea: []),
      revenue: RevenueAnalyticsEntity(
        currency: 'USD',
        summaryPaid: 0,
        summaryOutstanding: 0,
        trend: const [],
        monthOverMonth: zeroGrowth,
        weekOverWeek: zeroGrowth,
        quarterOverQuarter: zeroGrowth,
        yearOverYear: zeroGrowth,
        breakdown: const [],
        kpis: const FinancialKpisEntity(
          averageInvoiceValue: 0,
          averageRevenuePerClient: 0,
          averageRevenuePerCase: 0,
          revenuePerLawyer: 0,
          revenuePerMonth: 0,
          collectionRate: 0,
          paymentSuccessRate: 0,
          outstandingBalance: 0,
          averagePaymentDelayDays: 0,
          currency: 'USD',
        ),
        lineChart: emptySeries,
        areaChart: emptySeries,
        barChart: emptySeries,
        pieChart: emptySeries,
      ),
      team: const TeamPerformanceEntity(
        totalUsers: 0,
        activeUsers: 0,
        lawyers: 0,
        assistants: 0,
        admins: 0,
        averageCasesPerLawyer: 0,
        averageClosedCases: 0,
        averageWinRate: 0,
        roleSeries: [],
      ),
    );
  }

  @override
  List<Object?> get props => [
        casesByStatus,
        revenueByMonth,
        caseMixByPracticeArea,
        hearingDistribution,
        billingStatistics,
        monthlyActivity,
        caseMix,
        revenue,
        team,
      ];
}
