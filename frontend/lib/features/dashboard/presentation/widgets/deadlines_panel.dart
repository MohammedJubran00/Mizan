import 'package:flutter/material.dart';

import '../../../../core/theme/mizan_theme_extension.dart';
import '../../domain/entities/dashboard_entity.dart';
import 'dashboard_empty_state.dart';
import 'dashboard_surface.dart';
import 'priority_tone.dart';
import 'section_error.dart';
import 'skeleton.dart';

class DeadlinesPanel extends StatelessWidget {
  const DeadlinesPanel({
    super.key,
    required this.items,
    required this.isLoading,
    this.errorMessage,
    this.onRetry,
  });

  final List<DeadlineEntity> items;
  final bool isLoading;
  final String? errorMessage;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurface(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Deadlines', style: theme.textTheme.titleMedium),
          const SizedBox(height: 16),
          if (isLoading)
            const ListSkeleton(rows: 3)
          else if (errorMessage != null)
            SectionError(
              message: errorMessage!,
              onRetry: onRetry,
              compact: true,
            )
          else if (items.isEmpty)
            const DashboardEmptyState(
              icon: Icons.flag_outlined,
              title: 'No Deadlines',
              message: 'Filing and matter deadlines will show up here.',
            )
          else
            ...List.generate(items.length, (index) {
              final item = items[index];
              return Padding(
                padding: EdgeInsets.only(
                  bottom: index == items.length - 1 ? 0 : 12,
                ),
                child: _DeadlineTile(deadline: item),
              );
            }),
        ],
      ),
    );
  }
}

class _DeadlineTile extends StatelessWidget {
  const _DeadlineTile({required this.deadline});

  final DeadlineEntity deadline;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mizan = context.mizanTheme;
    final completed = deadline.isCompleted;
    final critical = deadline.isCritical && !completed;
    final accent = completed
        ? mizan.success
        : critical
            ? mizan.danger
            : priorityTone(mizan, deadline.priority);

    return Semantics(
      label: '${deadline.title}. ${deadline.daysRemaining} days remaining.',
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: critical
              ? mizan.danger.withValues(alpha: 0.06)
              : mizan.contentBackground,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: critical ? mizan.danger.withValues(alpha: 0.35) : mizan.cardBorder,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 4,
              height: 48,
              decoration: BoxDecoration(
                color: accent,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    deadline.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      decoration:
                          completed ? TextDecoration.lineThrough : null,
                    ),
                  ),
                  const SizedBox(height: 6),
                  if (deadline.caseTitle != null &&
                      deadline.caseTitle!.isNotEmpty)
                    Text(
                      deadline.caseTitle!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall,
                    ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      _Badge(
                        label: deadline.priority,
                        color: accent,
                      ),
                      _Badge(
                        label: completed
                            ? 'Completed'
                            : _remaining(deadline.daysRemaining),
                        color: theme.colorScheme.onSurface
                            .withValues(alpha: 0.6),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _remaining(int days) {
    if (days < 0) return '${days.abs()}d overdue';
    if (days == 0) return 'Due today';
    if (days == 1) return '1 day left';
    return '$days days left';
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: color,
              fontSize: 10,
            ),
      ),
    );
  }
}
