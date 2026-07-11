import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/session/session_cubit.dart';
import '../../../../core/theme/mizan_theme_extension.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../domain/entities/dashboard_entity.dart';

/// Dashboard top header — greeting, workspace, date, actions.
class DashboardHeader extends StatelessWidget {
  const DashboardHeader({
    super.key,
    required this.showMenuButton,
    this.onMenuPressed,
    this.greeting,
    this.formattedDate,
    this.workspaceName,
    this.unreadCount = 0,
    this.onNotificationPressed,
    this.onQuickAction,
  });

  final bool showMenuButton;
  final VoidCallback? onMenuPressed;
  final GreetingEntity? greeting;
  final String? formattedDate;
  final String? workspaceName;
  final int unreadCount;
  final VoidCallback? onNotificationPressed;
  final VoidCallback? onQuickAction;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mizan = context.mizanTheme;
    final size = MediaQuery.sizeOf(context);
    final compact = size.width < 720;
    final session = context.watch<SessionCubit>().state;

    final message = greeting?.message.isNotEmpty == true
        ? greeting!.message
        : _fallbackGreeting(session.firstName);
    final dateText = formattedDate ?? '';
    final workspace = workspaceName ??
        session.workspace?.name ??
        'Workspace';

    return Container(
      padding: EdgeInsets.fromLTRB(
        compact ? 16 : 28,
        compact ? 16 : 22,
        compact ? 16 : 28,
        compact ? 12 : 16,
      ),
      decoration: BoxDecoration(
        color: mizan.cardBackground,
        border: Border(bottom: BorderSide(color: mizan.cardBorder)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (showMenuButton) ...[
                IconButton(
                  onPressed: onMenuPressed,
                  tooltip:
                      MaterialLocalizations.of(context).openAppDrawerTooltip,
                  icon: const Icon(Icons.menu_rounded),
                ),
                const SizedBox(width: 4),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 280),
                      child: Text(
                        message,
                        key: ValueKey(message),
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontSize: compact ? 22 : 28,
                          letterSpacing: -0.4,
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 10,
                      runSpacing: 6,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        _MetaChip(
                          icon: Icons.apartment_rounded,
                          label: workspace,
                        ),
                        if (dateText.isNotEmpty)
                          _MetaChip(
                            icon: Icons.calendar_today_outlined,
                            label: dateText,
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              if (!compact)
                FilledButton.tonalIcon(
                  onPressed: onQuickAction,
                  icon: const Icon(Icons.add_rounded, size: 18),
                  label: const Text('Quick action'),
                ),
              const SizedBox(width: 4),
              IconButton(
                visualDensity: VisualDensity.compact,
                tooltip: context.read<ThemeCubit>().state.isDark
                    ? 'Switch to light theme'
                    : 'Switch to dark theme',
                onPressed: () => context.read<ThemeCubit>().toggle(),
                icon: Icon(
                  context.watch<ThemeCubit>().state.isDark
                      ? Icons.light_mode_outlined
                      : Icons.dark_mode_outlined,
                ),
              ),
              Stack(
                clipBehavior: Clip.none,
                children: [
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    tooltip: 'Notifications',
                    onPressed: onNotificationPressed,
                    icon: const Icon(Icons.notifications_none_rounded),
                  ),
                  if (unreadCount > 0)
                    Positioned(
                      right: 6,
                      top: 6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 5,
                          vertical: 1,
                        ),
                        decoration: BoxDecoration(
                          color: mizan.danger,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          unreadCount > 99 ? '99+' : '$unreadCount',
                          style: theme.textTheme.labelLarge?.copyWith(
                            color: Colors.white,
                            fontSize: 9,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 2),
              CircleAvatar(
                radius: compact ? 16 : 18,
                backgroundColor: mizan.accent,
                child: Text(
                  session.initials,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: Colors.black,
                    fontSize: compact ? 11 : 12,
                  ),
                ),
              ),
            ],
          ),
          if (compact) ...[
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerLeft,
              child: FilledButton.tonalIcon(
                onPressed: onQuickAction,
                icon: const Icon(Icons.add_rounded, size: 18),
                label: const Text('Quick action'),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _fallbackGreeting(String firstName) {
    final hour = DateTime.now().hour;
    final period = hour < 12
        ? 'Good Morning'
        : hour < 17
            ? 'Good Afternoon'
            : 'Good Evening';
    if (firstName.isEmpty) return period;
    return '$period $firstName';
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mizan = context.mizanTheme;
    final fallbackMax = MediaQuery.sizeOf(context).width * 0.55;

    return LayoutBuilder(
      builder: (context, constraints) {
        final available =
            constraints.maxWidth.isFinite ? constraints.maxWidth : fallbackMax;
        final textMax = (available - 36).clamp(48.0, fallbackMax);

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: mizan.contentBackground,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: mizan.cardBorder),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 14, color: mizan.accent),
              const SizedBox(width: 6),
              ConstrainedBox(
                constraints: BoxConstraints(maxWidth: textMax),
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
