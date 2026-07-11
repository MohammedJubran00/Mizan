import 'package:flutter/material.dart';

import '../../../../../core/theme/design_tokens.dart';
import '../../../../../core/theme/mizan_theme_extension.dart';
import '../../../domain/entities/dashboard_charts_entity.dart';

class GrowthBadge extends StatelessWidget {
  const GrowthBadge({super.key, required this.metric});

  final RevenueGrowthMetricEntity metric;

  @override
  Widget build(BuildContext context) {
    final mizan = context.mizanTheme;
    final theme = Theme.of(context);
    final isUp = metric.direction == 'INCREASE';
    final isDown = metric.direction == 'DECREASE';
    final color = isUp
        ? mizan.success
        : isDown
            ? mizan.danger
            : theme.colorScheme.onSurface.withValues(alpha: 0.55);
    final icon = isUp
        ? Icons.trending_up_rounded
        : isDown
            ? Icons.trending_down_rounded
            : Icons.trending_flat_rounded;
    final sign = isUp ? '+' : isDown ? '' : '';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(DesignTokens.radiusFull),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            '$sign${metric.percentage.toStringAsFixed(1)}%',
            style: theme.textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class RevenueGrowthPanel extends StatelessWidget {
  const RevenueGrowthPanel({super.key, this.analytics});

  final RevenueAnalyticsEntity? analytics;

  @override
  Widget build(BuildContext context) {
    if (analytics == null) {
      return const SizedBox.shrink();
    }
    final items = [
      _GrowthRow(label: 'Week vs Last Week', metric: analytics!.weekOverWeek),
      _GrowthRow(label: 'Month vs Last Month', metric: analytics!.monthOverMonth),
      _GrowthRow(
        label: 'Quarter vs Last Quarter',
        metric: analytics!.quarterOverQuarter,
      ),
      _GrowthRow(label: 'Year vs Last Year', metric: analytics!.yearOverYear),
    ];

    return Column(
      children: [
        for (var i = 0; i < items.length; i++) ...[
          if (i > 0) const SizedBox(height: DesignTokens.space12),
          items[i],
        ],
      ],
    );
  }
}

class _GrowthRow extends StatelessWidget {
  const _GrowthRow({required this.label, required this.metric});

  final String label;
  final RevenueGrowthMetricEntity metric;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mizan = context.mizanTheme;
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: DesignTokens.space12,
        vertical: DesignTokens.space12,
      ),
      decoration: BoxDecoration(
        color: mizan.contentBackground,
        borderRadius: BorderRadius.circular(DesignTokens.radiusMd),
        border: Border.all(color: mizan.cardBorder),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: theme.colorScheme.onSurface,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${_fmt(metric.previousValue)} → ${_fmt(metric.currentValue)}',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          GrowthBadge(metric: metric),
        ],
      ),
    );
  }

  static String _fmt(double v) {
    if (v >= 1000000) return '${(v / 1000000).toStringAsFixed(1)}M';
    if (v >= 1000) return '${(v / 1000).toStringAsFixed(1)}K';
    if (v == v.roundToDouble()) return v.toInt().toString();
    return v.toStringAsFixed(2);
  }
}
