import 'package:flutter/material.dart';

import '../../../../core/constants/app_strings.dart';
import '../../../../core/theme/mizan_theme_extension.dart';

/// Centered empty / placeholder content for dashboard sections.
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    this.icon = Icons.folder_open_outlined,
    this.title = AppStrings.comingSoon,
    this.message = AppStrings.emptyStateHint,
  });

  final IconData icon;
  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final iconBox = (size.shortestSide * 0.14).clamp(64.0, 88.0);
    final theme = Theme.of(context);
    final mizan = context.mizanTheme;

    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: (size.width * 0.72).clamp(280.0, 420.0),
        ),
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
              child: Icon(
                icon,
                size: iconBox * 0.42,
                color: mizan.accent,
              ),
            ),
            SizedBox(height: iconBox * 0.35),
            Text(
              title,
              textAlign: TextAlign.center,
              style: theme.textTheme.titleLarge?.copyWith(
                fontSize: (iconBox * 0.28).clamp(16.0, 20.0),
                letterSpacing: -0.2,
              ),
            ),
            SizedBox(height: iconBox * 0.14),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontSize: (iconBox * 0.22).clamp(13.5, 15.5),
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
