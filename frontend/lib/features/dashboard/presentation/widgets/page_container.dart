import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/app_colors.dart';
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

    return ColoredBox(
      color: AppColors.contentBackground,
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
                    style: GoogleFonts.playfairDisplay(
                      fontSize: titleSize,
                      fontWeight: FontWeight.w700,
                      color: AppColors.navyDeep,
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
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: (titleSize * 0.42).clamp(14.0, 16.0),
                        fontWeight: FontWeight.w400,
                        color: AppColors.textSecondary,
                        height: 1.55,
                      ),
                    ),
                  ),
                  SizedBox(height: padding.top * 1.1),
                  ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight: (constraints.maxHeight * 0.55).clamp(280.0, 520.0),
                    ),
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(radius),
                        border: Border.all(color: AppColors.cardBorder),
                        boxShadow: const [
                          BoxShadow(
                            color: AppColors.shadow,
                            blurRadius: 18,
                            offset: Offset(0, 6),
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
