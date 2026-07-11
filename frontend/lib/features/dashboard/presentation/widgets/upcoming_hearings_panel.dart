import 'package:flutter/material.dart';

import '../../../../core/theme/mizan_theme_extension.dart';
import '../../domain/entities/dashboard_entity.dart';
import 'dashboard_empty_state.dart';
import 'dashboard_surface.dart';
import 'priority_tone.dart';
import 'section_error.dart';
import 'skeleton.dart';

class UpcomingHearingsPanel extends StatelessWidget {
  const UpcomingHearingsPanel({
    super.key,
    required this.items,
    required this.isLoading,
    this.errorMessage,
    this.onRetry,
  });

  final List<HearingEntity> items;
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
          Row(
            children: [
              Expanded(
                child: Text(
                  'Upcoming Hearings',
                  style: theme.textTheme.titleMedium,
                ),
              ),
              if (!isLoading && items.isNotEmpty)
                Text(
                  '${items.length}',
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: context.mizanTheme.accent,
                  ),
                ),
            ],
          ),
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
              icon: Icons.gavel_outlined,
              title: 'No Hearings Scheduled',
              message: 'Upcoming court appearances will appear here.',
            )
          else
            ...List.generate(items.length, (index) {
              final item = items[index];
              return Padding(
                padding: EdgeInsets.only(
                  bottom: index == items.length - 1 ? 0 : 12,
                ),
                child: _HearingTile(hearing: item),
              );
            }),
        ],
      ),
    );
  }
}

class _HearingTile extends StatelessWidget {
  const _HearingTile({required this.hearing});

  final HearingEntity hearing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mizan = context.mizanTheme;
    final remaining = _remainingLabel(hearing.daysRemaining);
    final priorityColor = priorityTone(mizan, hearing.priority);

    return Semantics(
      label:
          '${hearing.title}. ${hearing.courtName ?? ''}. ${hearing.clientName ?? ''}. $remaining',
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: mizan.contentBackground,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: mizan.cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    hearing.caseTitle ?? hearing.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                _Chip(label: hearing.priority, color: priorityColor),
              ],
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 12,
              runSpacing: 6,
              children: [
                if (hearing.courtName != null && hearing.courtName!.isNotEmpty)
                  _Meta(icon: Icons.account_balance_outlined, text: hearing.courtName!),
                if (hearing.clientName != null && hearing.clientName!.isNotEmpty)
                  _Meta(icon: Icons.person_outline, text: hearing.clientName!),
                if (hearing.assignedLawyer != null &&
                    hearing.assignedLawyer!.isNotEmpty)
                  _Meta(icon: Icons.badge_outlined, text: hearing.assignedLawyer!),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Icon(Icons.schedule_rounded, size: 16, color: mizan.accent),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    [
                      if (hearing.hearingTime != null &&
                          hearing.hearingTime!.isNotEmpty)
                        hearing.hearingTime!,
                      remaining,
                    ].where((e) => e.isNotEmpty).join(' · '),
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ),
                _Chip(
                  label: hearing.status,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.55),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _remainingLabel(int days) {
    if (days < 0) return '${days.abs()}d overdue';
    if (days == 0) return 'Today';
    if (days == 1) return 'Tomorrow';
    return 'In $days days';
  }
}

class _Meta extends StatelessWidget {
  const _Meta({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: Theme.of(context).iconTheme.color),
        const SizedBox(width: 4),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 160),
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
      ],
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.color});

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
