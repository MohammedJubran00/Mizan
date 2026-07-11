import 'package:flutter/material.dart';

import '../../../../core/constants/app_strings.dart';
import '../../../../core/theme/mizan_theme_extension.dart';
import '../../domain/entities/dashboard_entity.dart';
import 'dashboard_empty_state.dart';
import 'dashboard_surface.dart';
import 'section_error.dart';
import 'skeleton.dart';

class RecentActivityPanel extends StatelessWidget {
  const RecentActivityPanel({
    super.key,
    required this.groups,
    required this.isLoading,
    required this.hasMore,
    required this.isLoadingMore,
    this.errorMessage,
    this.onRetry,
    this.onLoadMore,
  });

  final List<ActivityGroupEntity> groups;
  final bool isLoading;
  final bool hasMore;
  final bool isLoadingMore;
  final String? errorMessage;
  final VoidCallback? onRetry;
  final VoidCallback? onLoadMore;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasItems = groups.any((g) => g.items.isNotEmpty);

    return DashboardSurface(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(AppStrings.recentActivity, style: theme.textTheme.titleMedium),
          const SizedBox(height: 16),
          if (isLoading)
            const ListSkeleton(rows: 5)
          else if (errorMessage != null && !hasItems)
            SectionError(
              message: errorMessage!,
              onRetry: onRetry,
              compact: true,
            )
          else if (!hasItems)
            const DashboardEmptyState(
              icon: Icons.timeline_outlined,
              title: AppStrings.noRecentActivity,
              message: 'Team actions across your workspace will appear here.',
            )
          else ...[
            for (final group in groups)
              if (group.items.isNotEmpty) ...[
                Padding(
                  padding: const EdgeInsets.only(bottom: 10, top: 4),
                  child: Text(
                    _displayGroupLabel(group),
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: context.mizanTheme.accent,
                    ),
                  ),
                ),
                ...List.generate(group.items.length, (index) {
                  final item = group.items[index];
                  final isLast = index == group.items.length - 1;
                  return _ActivityTile(item: item, showLine: !isLast);
                }),
              ],
            if (hasMore) ...[
              const SizedBox(height: 8),
              Center(
                child: TextButton(
                  onPressed: isLoadingMore ? null : onLoadMore,
                  child: isLoadingMore
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text(AppStrings.loadMore),
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }

  String _displayGroupLabel(ActivityGroupEntity group) {
    switch (group.key.toUpperCase()) {
      case 'TODAY':
        return 'Today';
      case 'YESTERDAY':
        return 'Yesterday';
      default:
        return group.label.isNotEmpty ? group.label : 'Earlier';
    }
  }
}

class _ActivityTile extends StatelessWidget {
  const _ActivityTile({required this.item, required this.showLine});

  final ActivityEntity item;
  final bool showLine;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mizan = context.mizanTheme;

    return Semantics(
      label:
          '${item.actorName ?? item.title}. ${item.description ?? item.action}. ${item.relativeTime}',
      child: IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: mizan.accentSoft,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  item.initials,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),
              if (showLine)
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    color: mizan.cardBorder,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(
                        _iconFor(item.icon),
                        size: 16,
                        color: mizan.accent,
                      ),
                    ],
                  ),
                  if (item.description != null &&
                      item.description!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      item.description!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Text(
                        item.relativeTime.isNotEmpty
                            ? item.relativeTime
                            : item.action,
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: mizan.contentBackground,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: mizan.cardBorder),
                        ),
                        child: Text(
                          item.severity,
                          style: theme.textTheme.labelLarge?.copyWith(
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ),
    );
  }

  IconData _iconFor(String key) {
    switch (key.toLowerCase()) {
      case 'case':
      case 'folder':
        return Icons.folder_outlined;
      case 'hearing':
      case 'gavel':
        return Icons.gavel_rounded;
      case 'invoice':
      case 'billing':
        return Icons.receipt_long_outlined;
      case 'client':
        return Icons.person_outline;
      case 'document':
        return Icons.description_outlined;
      default:
        return Icons.bolt_outlined;
    }
  }
}
