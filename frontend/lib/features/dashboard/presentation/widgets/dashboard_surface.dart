import 'package:flutter/material.dart';

import '../../../../core/theme/design_tokens.dart';
import '../../../../core/theme/mizan_theme_extension.dart';

/// Soft elevated surface used by dashboard cards and lists.
class DashboardSurface extends StatelessWidget {
  const DashboardSurface({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = context.mizanTheme;
    final content = Padding(
      padding: padding ?? DesignTokens.cardPadding,
      child: child,
    );

    return DecoratedBox(
      decoration: BoxDecoration(
        color: theme.cardBackground,
        borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
        border: Border.all(color: theme.cardBorder),
        boxShadow: [
          BoxShadow(
            color: theme.shadow,
            blurRadius: DesignTokens.shadowBlur,
            offset: DesignTokens.shadowOffset,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: onTap == null
            ? content
            : InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(DesignTokens.radiusLg),
                child: content,
              ),
      ),
    );
  }
}
