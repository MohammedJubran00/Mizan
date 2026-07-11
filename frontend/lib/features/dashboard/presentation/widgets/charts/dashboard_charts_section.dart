import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../../core/theme/design_tokens.dart';
import '../../../../../core/theme/mizan_theme_extension.dart';
import '../../../domain/entities/dashboard_charts_entity.dart';
import '../../cubit/chart_cubit.dart';
import '../../cubit/dashboard_cubit.dart';
import '../../cubit/overview_cubit.dart';
import '../../cubit/revenue_cubit.dart';
import 'dashboard_bar_chart.dart';
import 'dashboard_chart_card.dart';
import 'dashboard_pie_chart.dart';
import 'revenue_growth_badges.dart';
import 'revenue_trend_chart.dart';

/// Chart grid for the professional dashboard — consumes [ChartCubit] only.
class DashboardChartsSection extends StatelessWidget {
  const DashboardChartsSection({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ChartCubit, ChartState>(
      buildWhen: (prev, next) =>
          prev.status != next.status ||
          prev.charts != next.charts ||
          prev.errorMessage != next.errorMessage,
      builder: (context, state) {
        final charts = state.charts;
        final loading = state.status == SectionStatus.loading ||
            state.status == SectionStatus.initial;
        final error = state.status == SectionStatus.failure
            ? state.errorMessage
            : null;

        void retry() => context.read<DashboardCubit>().load();

        return LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth >= DesignTokens.breakpointDesktop;
            final medium = constraints.maxWidth >= DesignTokens.breakpointTablet;

            final revenueTrend = DashboardChartCard(
              title: 'Revenue Trend',
              subtitle: 'Monthly revenue from Billing',
              isLoading: loading,
              isEmpty: !loading &&
                  error == null &&
                  (charts?.revenue.lineChart.isEmpty ?? true),
              emptyTitle: 'No Revenue Yet',
              emptyMessage: 'Paid invoices and manual revenue will appear here.',
              errorMessage: error,
              onRetry: retry,
              delay: const Duration(milliseconds: 40),
              trailing: charts == null
                  ? null
                  : BlocSelector<RevenueCubit, RevenueState,
                      RevenueGrowthMetricEntity?>(
                      selector: (s) => s.analytics?.monthOverMonth,
                      builder: (context, mom) {
                        if (mom == null) return const SizedBox.shrink();
                        return GrowthBadge(metric: mom);
                      },
                    ),
              child: RevenueTrendChart(
                points: charts?.revenue.lineChart.points ?? const [],
                filled: true,
              ),
            );

            final caseStatus = DashboardChartCard(
              title: 'Case Status',
              subtitle: 'Distribution across case lifecycle',
              isLoading: loading,
              isEmpty: !loading &&
                  error == null &&
                  (charts?.casesByStatus.isEmpty ?? true),
              emptyTitle: 'No Cases Yet',
              emptyMessage: 'Create your first case to see status distribution.',
              errorMessage: error,
              onRetry: retry,
              delay: const Duration(milliseconds: 80),
              child: DashboardPieChart(
                points: charts?.casesByStatus ?? const [],
                centerLabel: 'Cases',
              ),
            );

            final caseMix = DashboardChartCard(
              title: 'Case Mix',
              subtitle: 'Practice area distribution',
              isLoading: loading,
              isEmpty: !loading &&
                  error == null &&
                  (charts?.caseMixByPracticeArea.isEmpty ?? true),
              emptyTitle: 'No Cases Yet',
              emptyMessage: 'Practice area mix appears once cases are filed.',
              errorMessage: error,
              onRetry: retry,
              delay: const Duration(milliseconds: 120),
              child: DashboardBarChart(
                points: charts?.caseMixByPracticeArea ?? const [],
                colorIndex: 1,
              ),
            );

            final revenueBreakdown = DashboardChartCard(
              title: 'Revenue Breakdown',
              subtitle: 'Sources from Billing records',
              isLoading: loading,
              isEmpty: !loading &&
                  error == null &&
                  (charts?.revenue.pieChart.isEmpty ?? true),
              emptyTitle: 'No Billing Data',
              emptyMessage: 'Invoice and manual revenue categories show here.',
              errorMessage: error,
              onRetry: retry,
              delay: const Duration(milliseconds: 160),
              child: DashboardPieChart(
                points: charts?.revenue.pieChart.points ?? const [],
                centerLabel: 'Revenue',
              ),
            );

            final hearingDist = DashboardChartCard(
              title: 'Hearing Distribution',
              subtitle: 'Today, upcoming, and resolved hearings',
              isLoading: loading,
              isEmpty: !loading &&
                  error == null &&
                  !(charts?.hearingDistribution.any((p) => p.value > 0) ??
                      false),
              emptyTitle: 'No Hearings',
              emptyMessage: 'Scheduled hearings will populate this chart.',
              errorMessage: error,
              onRetry: retry,
              delay: const Duration(milliseconds: 200),
              child: DashboardBarChart(
                points: charts?.hearingDistribution ?? const [],
                colorIndex: 2,
              ),
            );

            final billingStats = DashboardChartCard(
              title: 'Billing Statistics',
              subtitle: 'Paid, outstanding, and other balances',
              isLoading: loading,
              isEmpty: !loading &&
                  error == null &&
                  (charts?.billingStatistics.isEmpty ?? true),
              emptyTitle: 'No Billing Data',
              emptyMessage: 'Financial balances appear after billing activity.',
              errorMessage: error,
              onRetry: retry,
              delay: const Duration(milliseconds: 240),
              child: DashboardBarChart(
                points: charts?.billingStatistics ?? const [],
                colorIndex: 0,
              ),
            );

            final teamPerf = DashboardChartCard(
              title: 'Team Performance',
              subtitle: 'Roles and capacity across the workspace',
              isLoading: loading,
              isEmpty: !loading &&
                  error == null &&
                  (charts?.team.roleSeries.isEmpty ?? true),
              emptyTitle: 'No Team Activity',
              emptyMessage: 'Invite team members to see role distribution.',
              errorMessage: error,
              onRetry: retry,
              delay: const Duration(milliseconds: 280),
              trailing: charts == null
                  ? null
                  : _WinRateChip(rate: charts.team.averageWinRate),
              child: DashboardPieChart(
                points: charts?.team.roleSeries ?? const [],
                centerLabel: 'Team',
              ),
            );

            final growthCompare = DashboardChartCard(
              title: 'Revenue Growth',
              subtitle: 'Period comparisons from the analytics engine',
              isLoading: loading,
              isEmpty: !loading && error == null && charts == null,
              emptyTitle: 'No Revenue Yet',
              emptyMessage: 'Growth comparisons appear once revenue is recorded.',
              errorMessage: error,
              onRetry: retry,
              height: DesignTokens.chartHeightCompact,
              delay: const Duration(milliseconds: 100),
              child: RevenueGrowthPanel(analytics: charts?.revenue),
            );

            final monthlyActivity = DashboardChartCard(
              title: 'Monthly Activity',
              subtitle: 'Workspace activity volume',
              isLoading: loading,
              isEmpty: !loading &&
                  error == null &&
                  (charts?.monthlyActivity.isEmpty ?? true),
              emptyTitle: 'No Team Activity',
              emptyMessage: 'Activity volume builds as your team works.',
              errorMessage: error,
              onRetry: retry,
              delay: const Duration(milliseconds: 320),
              child: DashboardBarChart(
                points: charts?.monthlyActivity ?? const [],
                colorIndex: 3,
              ),
            );

            if (wide) {
              return Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 3, child: revenueTrend),
                      const SizedBox(width: DesignTokens.space16),
                      Expanded(flex: 2, child: growthCompare),
                    ],
                  ),
                  const SizedBox(height: DesignTokens.space16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: caseStatus),
                      const SizedBox(width: DesignTokens.space16),
                      Expanded(child: caseMix),
                      const SizedBox(width: DesignTokens.space16),
                      Expanded(child: revenueBreakdown),
                    ],
                  ),
                  const SizedBox(height: DesignTokens.space16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: hearingDist),
                      const SizedBox(width: DesignTokens.space16),
                      Expanded(child: billingStats),
                      const SizedBox(width: DesignTokens.space16),
                      Expanded(child: teamPerf),
                    ],
                  ),
                  const SizedBox(height: DesignTokens.space16),
                  monthlyActivity,
                ],
              );
            }

            if (medium) {
              return Column(
                children: [
                  revenueTrend,
                  const SizedBox(height: DesignTokens.space16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: growthCompare),
                      const SizedBox(width: DesignTokens.space16),
                      Expanded(child: caseStatus),
                    ],
                  ),
                  const SizedBox(height: DesignTokens.space16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: caseMix),
                      const SizedBox(width: DesignTokens.space16),
                      Expanded(child: revenueBreakdown),
                    ],
                  ),
                  const SizedBox(height: DesignTokens.space16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: hearingDist),
                      const SizedBox(width: DesignTokens.space16),
                      Expanded(child: billingStats),
                    ],
                  ),
                  const SizedBox(height: DesignTokens.space16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: teamPerf),
                      const SizedBox(width: DesignTokens.space16),
                      Expanded(child: monthlyActivity),
                    ],
                  ),
                ],
              );
            }

            return Column(
              children: [
                revenueTrend,
                const SizedBox(height: DesignTokens.space16),
                growthCompare,
                const SizedBox(height: DesignTokens.space16),
                caseStatus,
                const SizedBox(height: DesignTokens.space16),
                caseMix,
                const SizedBox(height: DesignTokens.space16),
                revenueBreakdown,
                const SizedBox(height: DesignTokens.space16),
                hearingDist,
                const SizedBox(height: DesignTokens.space16),
                billingStats,
                const SizedBox(height: DesignTokens.space16),
                teamPerf,
                const SizedBox(height: DesignTokens.space16),
                monthlyActivity,
              ],
            );
          },
        );
      },
    );
  }
}

class _WinRateChip extends StatelessWidget {
  const _WinRateChip({required this.rate});

  final double rate;

  @override
  Widget build(BuildContext context) {
    final mizan = context.mizanTheme;
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: mizan.accentSoft,
        borderRadius: BorderRadius.circular(DesignTokens.radiusFull),
      ),
      child: Text(
        'Win ${rate.toStringAsFixed(rate == rate.roundToDouble() ? 0 : 1)}%',
        style: theme.textTheme.labelSmall?.copyWith(
          color: theme.colorScheme.onSurface,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
