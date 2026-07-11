import 'package:flutter/material.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/app_colors.dart';

class AuthCard extends StatelessWidget {
  const AuthCard({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final radius = AppDimensions.cardRadius(size);
    final padding = AppDimensions.authCardPadding(size);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: AppColors.cardBorder),
        boxShadow: const [
          BoxShadow(
            color: AppColors.shadow,
            blurRadius: 28,
            offset: Offset(0, 10),
            spreadRadius: -4,
          ),
        ],
      ),
      child: Padding(
        padding: EdgeInsets.all(padding),
        child: child,
      ),
    );
  }
}
