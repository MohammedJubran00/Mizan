import 'package:flutter/material.dart';

import '../../../../core/theme/mizan_theme_extension.dart';

/// Theme-aware empty state for dashboard sections and charts.
class DashboardEmptyState extends StatelessWidget {
  const DashboardEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.compact = false,
  });

  final IconData icon;
  final String title;
  final String message;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mizan = context.mizanTheme;
    final size = MediaQuery.sizeOf(context);
    final iconBox = compact
        ? 56.0
        : (size.shortestSide * 0.12).clamp(56.0, 72.0);

    return Semantics(
      label: '$title. $message',
      child: Center(
        child: Padding(
          padding: EdgeInsets.symmetric(
            vertical: compact ? 12 : 20,
            horizontal: 12,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: iconBox,
                height: iconBox,
                decoration: BoxDecoration(
                  color: mizan.accentSoft,
                  borderRadius: BorderRadius.circular(iconBox * 0.28),
                ),
                child: Icon(icon, size: iconBox * 0.42, color: mizan.accent),
              ),
              SizedBox(height: iconBox * 0.22),
              Text(
                title,
                textAlign: TextAlign.center,
                style: (compact
                        ? theme.textTheme.titleSmall
                        : theme.textTheme.titleMedium)
                    ?.copyWith(
                  color: theme.colorScheme.onSurface,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                message,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodySmall ?? theme.textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
