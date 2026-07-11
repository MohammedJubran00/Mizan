import 'package:flutter/material.dart';

import '../../../../core/constants/app_strings.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/theme/mizan_theme_extension.dart';

/// Subtle offline / stale-data banner — does not block the dashboard.
class OfflineBanner extends StatelessWidget {
  const OfflineBanner({super.key, this.message = AppStrings.offlineBanner});

  final String message;

  @override
  Widget build(BuildContext context) {
    final mizan = context.mizanTheme;
    final theme = Theme.of(context);

    return Semantics(
      liveRegion: true,
      label: message,
      child: Material(
        color: mizan.warning.withValues(alpha: 0.12),
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: DesignTokens.space16,
            vertical: DesignTokens.space8,
          ),
          child: Row(
            children: [
              Icon(Icons.wifi_off_rounded, size: 18, color: mizan.warning),
              const SizedBox(width: DesignTokens.space8),
              Expanded(
                child: Text(
                  message,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
