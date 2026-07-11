import 'package:flutter/material.dart';

import '../../../../../core/theme/design_tokens.dart';
import '../dashboard_empty_state.dart';
import '../dashboard_surface.dart';
import '../section_error.dart';
import '../skeleton.dart';

/// Shared chrome for every dashboard chart — loading / empty / error / content.
///
/// Pass [height] for plot charts that need a fixed drawing viewport.
/// Omit [height] for content-driven panels (e.g. growth comparisons) so the
/// card grows with its children and never overflows a fixed box.
class DashboardChartCard extends StatelessWidget {
  const DashboardChartCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.isLoading,
    required this.isEmpty,
    required this.emptyTitle,
    required this.emptyMessage,
    required this.child,
    this.errorMessage,
    this.onRetry,
    this.height,
    this.trailing,
    this.delay = Duration.zero,
  });

  final String title;
  final String subtitle;
  final bool isLoading;
  final bool isEmpty;
  final String emptyTitle;
  final String emptyMessage;
  final Widget child;
  final String? errorMessage;
  final VoidCallback? onRetry;

  /// Fixed viewport for fl_chart plots. Null = size to content.
  final double? height;
  final Widget? trailing;
  final Duration delay;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final body = AnimatedSwitcher(
      duration: DesignTokens.durationNormal,
      child: _body(context),
    );

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: DesignTokens.durationSlow + delay,
      curve: DesignTokens.curveStandard,
      builder: (context, value, animatedChild) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, (1 - value) * 16),
            child: animatedChild,
          ),
        );
      },
      child: DashboardSurface(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: theme.colorScheme.onSurface,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: DesignTokens.space4),
                      Text(
                        subtitle,
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                ?trailing,
              ],
            ),
            const SizedBox(height: DesignTokens.space16),
            if (height != null)
              SizedBox(height: height, child: body)
            else
              body,
          ],
        ),
      ),
    );
  }

  Widget _body(BuildContext context) {
    if (isLoading) {
      return ChartSkeleton(
        key: const ValueKey('loading'),
        height: height ?? DesignTokens.chartHeightCompact,
      );
    }
    if (errorMessage != null) {
      return SectionError(
        key: const ValueKey('error'),
        message: errorMessage!,
        onRetry: onRetry,
        compact: true,
      );
    }
    if (isEmpty) {
      return DashboardEmptyState(
        key: const ValueKey('empty'),
        icon: Icons.bar_chart_rounded,
        title: emptyTitle,
        message: emptyMessage,
        compact: true,
      );
    }
    return Semantics(
      label: '$title. $subtitle',
      child: KeyedSubtree(key: const ValueKey('content'), child: child),
    );
  }
}

/// Skeleton that works in both fixed-height and intrinsic layouts.
class ChartSkeleton extends StatelessWidget {
  const ChartSkeleton({super.key, this.height = 220});

  final double height;

  @override
  Widget build(BuildContext context) {
    final plotHeight = height * 0.78;
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SizedBox(
          height: plotHeight,
          child: Align(
            alignment: Alignment.bottomCenter,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                for (var i = 0; i < 6; i++) ...[
                  if (i > 0) const SizedBox(width: 8),
                  Expanded(
                    child: SkeletonBox(
                      height: plotHeight * (0.35 + (i % 4) * 0.12),
                      borderRadius: 8,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Row(
          children: [
            SkeletonBox(width: 64, height: 10),
            Spacer(),
            SkeletonBox(width: 48, height: 10),
          ],
        ),
      ],
    );
  }
}

class ChartLegend extends StatelessWidget {
  const ChartLegend({super.key, required this.items});

  final List<ChartLegendItem> items;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Wrap(
      spacing: DesignTokens.space12,
      runSpacing: DesignTokens.space8,
      children: [
        for (final item in items)
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: DesignTokens.chartLegendDot,
                height: DesignTokens.chartLegendDot,
                decoration: BoxDecoration(
                  color: item.color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: DesignTokens.space4),
              Text(
                item.label,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                ),
              ),
            ],
          ),
      ],
    );
  }
}

class ChartLegendItem {
  const ChartLegendItem({required this.label, required this.color});

  final String label;
  final Color color;
}
