import 'package:flutter/material.dart';

import '../../../../core/theme/mizan_theme_extension.dart';
import '../../domain/entities/dashboard_entity.dart';

class StatOverviewCard extends StatelessWidget {
  const StatOverviewCard({
    super.key,
    required this.card,
    required this.icon,
    this.delay = Duration.zero,
  });

  final StatCardEntity card;
  final IconData icon;
  final Duration delay;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mizan = context.mizanTheme;
    final growth = card.growthPercent;
    final direction = card.growthDirection;
    final showGrowth = growth != null && direction != null;
    final isUp = direction == 'INCREASE';
    final isDown = direction == 'DECREASE';
    final growthColor = isUp
        ? mizan.success
        : isDown
            ? mizan.danger
            : theme.colorScheme.onSurface.withValues(alpha: 0.55);

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 420 + delay.inMilliseconds),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, (1 - value) * 12),
            child: child,
          ),
        );
      },
      child: Semantics(
        label: '${card.title}: ${card.value}. ${card.subtitle}',
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: mizan.cardBackground,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: mizan.cardBorder),
            boxShadow: [
              BoxShadow(
                color: mizan.shadow,
                blurRadius: 20,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: mizan.accentSoft,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, color: mizan.accent, size: 20),
                  ),
                  const Spacer(),
                  if (showGrowth)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: growthColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isUp
                                ? Icons.trending_up_rounded
                                : isDown
                                    ? Icons.trending_down_rounded
                                    : Icons.trending_flat_rounded,
                            size: 14,
                            color: growthColor,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${growth.abs().toStringAsFixed(growth.abs() >= 10 ? 0 : 1)}%',
                            style: theme.textTheme.labelLarge?.copyWith(
                              color: growthColor,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    )
                  else if (card.trendLabel != null &&
                      card.trendLabel!.isNotEmpty)
                    Flexible(
                      child: Text(
                        card.trendLabel!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: mizan.accent,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                card.title,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 6),
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  card.value,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.4,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                card.subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

IconData iconForStatTitle(String title) {
  switch (title) {
    case 'Active Cases':
      return Icons.folder_open_rounded;
    case 'Open Cases':
      return Icons.work_outline_rounded;
    case 'Revenue':
      return Icons.payments_outlined;
    case 'Upcoming Hearings':
      return Icons.gavel_rounded;
    case 'Deadlines':
      return Icons.flag_outlined;
    case 'Clients':
      return Icons.people_outline_rounded;
    case 'Invoices':
      return Icons.receipt_long_outlined;
    case 'Win Rate':
      return Icons.emoji_events_outlined;
    case 'Billable Hours':
      return Icons.schedule_rounded;
    case 'Team Members':
      return Icons.groups_outlined;
    default:
      return Icons.insights_outlined;
  }
}
