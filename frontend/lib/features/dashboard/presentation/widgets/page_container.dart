import 'package:flutter/material.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/mizan_theme_extension.dart';
import 'empty_state.dart';

/// Standard content frame for dashboard pages — title, description, body.
class PageContainer extends StatelessWidget {
  const PageContainer({
    super.key,
    required this.title,
    required this.description,
    this.child,
    this.icon,
  });

  final String title;
  final String description;
  final Widget? child;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final padding = AppDimensions.contentPadding(size);
    final titleSize = (size.width * 0.04).clamp(26.0, 34.0);
    final radius = AppDimensions.cardRadius(size);
    final theme = Theme.of(context);
    final mizan = context.mizanTheme;

    return ColoredBox(
      color: mizan.contentBackground,
      child: LayoutBuilder(
        builder: (context, constraints) {
          return SingleChildScrollView(
            padding: padding,
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: constraints.maxHeight - padding.vertical,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontSize: titleSize,
                      letterSpacing: -0.4,
                      height: 1.15,
                    ),
                  ),
                  SizedBox(height: padding.top * 0.35),
                  ConstrainedBox(
                    constraints: BoxConstraints(
                      maxWidth: (size.width * 0.55).clamp(280.0, 560.0),
                    ),
                    child: Text(
                      description,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontSize: (titleSize * 0.42).clamp(14.0, 16.0),
                        height: 1.55,
                      ),
                    ),
                  ),
                  SizedBox(height: padding.top * 1.1),
                  ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight:
                          (constraints.maxHeight * 0.55).clamp(280.0, 520.0),
                    ),
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: mizan.cardBackground,
                        borderRadius: BorderRadius.circular(radius),
                        border: Border.all(color: mizan.cardBorder),
                        boxShadow: [
                          BoxShadow(
                            color: mizan.shadow,
                            blurRadius: 18,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: EdgeInsets.all(padding.top * 1.2),
                        child: child ??
                            EmptyState(
                              icon: icon ?? Icons.folder_open_outlined,
                            ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
