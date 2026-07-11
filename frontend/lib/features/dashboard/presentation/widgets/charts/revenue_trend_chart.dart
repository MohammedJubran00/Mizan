import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../../../../core/theme/design_tokens.dart';
import '../../../../../core/theme/mizan_theme_extension.dart';
import '../../../domain/entities/dashboard_charts_entity.dart';
import '../../utils/chart_number_format.dart';

/// Renders backend line / area series — no client-side aggregation.
class RevenueTrendChart extends StatelessWidget {
  const RevenueTrendChart({
    super.key,
    required this.points,
    this.filled = true,
  });

  final List<ChartPointEntity> points;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    final mizan = context.mizanTheme;
    final theme = Theme.of(context);
    if (points.isEmpty) return const SizedBox.shrink();

    final spots = <FlSpot>[
      for (var i = 0; i < points.length; i++)
        FlSpot(i.toDouble(), points[i].value),
    ];
    final maxY = points.map((p) => p.value).reduce((a, b) => a > b ? a : b);
    final minY = points.map((p) => p.value).reduce((a, b) => a < b ? a : b);
    final yPad = maxY == minY ? (maxY == 0 ? 1 : maxY * 0.2) : (maxY - minY) * 0.15;

    return LineChart(
      LineChartData(
        minY: (minY - yPad).clamp(0, double.infinity),
        maxY: maxY + yPad,
        lineTouchData: LineTouchData(
          enabled: true,
          touchTooltipData: LineTouchTooltipData(
            getTooltipColor: (_) => mizan.chartTooltipBackground,
            getTooltipItems: (touched) {
              return touched.map((spot) {
                final i = spot.x.round().clamp(0, points.length - 1);
                final point = points[i];
                return LineTooltipItem(
                  '${point.label}\n${ChartNumberFormat.display(point.value)}',
                  TextStyle(
                    color: mizan.chartTooltipForeground,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                );
              }).toList();
            },
          ),
        ),
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          getDrawingHorizontalLine: (_) => FlLine(
            color: mizan.chartGrid,
            strokeWidth: 1,
          ),
        ),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 42,
              getTitlesWidget: (value, meta) {
                if (value == meta.min || value == meta.max) {
                  return const SizedBox.shrink();
                }
                return Text(
                  ChartNumberFormat.compact(value),
                  style: theme.textTheme.labelSmall?.copyWith(fontSize: 10),
                );
              },
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 28,
              interval: points.length > 8 ? 2 : 1,
              getTitlesWidget: (value, meta) {
                final i = value.round();
                if (i < 0 || i >= points.length) return const SizedBox.shrink();
                if (points.length > 8 && i % 2 != 0) {
                  return const SizedBox.shrink();
                }
                final label = points[i].label;
                final short = label.length > 8 ? label.substring(0, 7) : label;
                return Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    short,
                    style: theme.textTheme.labelSmall?.copyWith(fontSize: 10),
                  ),
                );
              },
            ),
          ),
        ),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            curveSmoothness: 0.28,
            color: mizan.accent,
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: FlDotData(
              show: points.length <= 14,
              getDotPainter: (spot, percent, bar, index) => FlDotCirclePainter(
                radius: 3.5,
                color: mizan.cardBackground,
                strokeWidth: 2,
                strokeColor: mizan.accent,
              ),
            ),
            belowBarData: BarAreaData(
              show: filled,
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  mizan.accent.withValues(alpha: 0.28),
                  mizan.accent.withValues(alpha: 0.02),
                ],
              ),
            ),
          ),
        ],
      ),
      duration: DesignTokens.durationChart,
      curve: DesignTokens.curveStandard,
    );
  }
}
