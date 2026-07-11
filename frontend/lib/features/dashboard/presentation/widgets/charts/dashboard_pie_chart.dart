import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../../../../core/theme/design_tokens.dart';
import '../../../../../core/theme/mizan_theme_extension.dart';
import '../../../domain/entities/dashboard_charts_entity.dart';
import 'dashboard_chart_card.dart';

/// Pie / doughnut chart from backend distribution points.
class DashboardPieChart extends StatefulWidget {
  const DashboardPieChart({
    super.key,
    required this.points,
    this.centerLabel,
  });

  final List<ChartPointEntity> points;
  final String? centerLabel;

  @override
  State<DashboardPieChart> createState() => _DashboardPieChartState();
}

class _DashboardPieChartState extends State<DashboardPieChart> {
  int? _touched;

  @override
  Widget build(BuildContext context) {
    final mizan = context.mizanTheme;
    final theme = Theme.of(context);
    final points = widget.points.where((p) => p.value > 0).toList();
    if (points.isEmpty) return const SizedBox.shrink();

    final total = points.fold<double>(0, (sum, p) => sum + p.value);

    return Column(
      children: [
        Expanded(
          child: Stack(
            alignment: Alignment.center,
            children: [
              PieChart(
                PieChartData(
                  sectionsSpace: 2,
                  centerSpaceRadius: 48,
                  pieTouchData: PieTouchData(
                    touchCallback: (event, response) {
                      setState(() {
                        if (!event.isInterestedForInteractions ||
                            response == null ||
                            response.touchedSection == null) {
                          _touched = null;
                          return;
                        }
                        _touched =
                            response.touchedSection!.touchedSectionIndex;
                      });
                    },
                  ),
                  sections: [
                    for (var i = 0; i < points.length; i++)
                      PieChartSectionData(
                        color: mizan.chartColorAt(i),
                        value: points[i].value,
                        title: _touched == i
                            ? _percent(points[i], total)
                            : '',
                        radius: _touched == i ? 58 : 48,
                        titleStyle: TextStyle(
                          color: mizan.chartTooltipForeground,
                          fontWeight: FontWeight.w700,
                          fontSize: 11,
                        ),
                      ),
                  ],
                ),
                duration: DesignTokens.durationChart,
                curve: DesignTokens.curveStandard,
              ),
              if (widget.centerLabel != null)
                Text(
                  widget.centerLabel!,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: theme.colorScheme.onSurface,
                    fontWeight: FontWeight.w700,
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: DesignTokens.space8),
        ChartLegend(
          items: [
            for (var i = 0; i < points.length; i++)
              ChartLegendItem(
                label: points[i].label,
                color: mizan.chartColorAt(i),
              ),
          ],
        ),
      ],
    );
  }

  String _percent(ChartPointEntity point, double total) {
    if (point.percentage != null) {
      return '${point.percentage!.toStringAsFixed(0)}%';
    }
    if (total <= 0) return '0%';
    return '${((point.value / total) * 100).toStringAsFixed(0)}%';
  }
}
