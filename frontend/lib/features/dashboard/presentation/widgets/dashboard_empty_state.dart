import 'package:flutter/material.dart';

import '../../../../core/theme/mizan_theme_extension.dart';

/// Theme-aware empty state for dashboard sections.
class DashboardEmptyState extends StatelessWidget {
  const DashboardEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
  });

  final IconData icon;
  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mizan = context.mizanTheme;
    final size = MediaQuery.sizeOf(context);
    final iconBox = (size.shortestSide * 0.12).clamp(56.0, 72.0);

    return Semantics(
      label: '$title. $message',
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
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
              SizedBox(height: iconBox * 0.28),
              Text(
                title,
                textAlign: TextAlign.center,
                style: theme.textTheme.titleMedium,
              ),
              const SizedBox(height: 6),
              Text(
                message,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
