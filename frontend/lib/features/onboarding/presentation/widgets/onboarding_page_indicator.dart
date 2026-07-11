import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

/// Animated three-dot page indicator matching the reference:
/// small inactive dots + elongated active pill.
class OnboardingPageIndicator extends StatelessWidget {
  const OnboardingPageIndicator({
    super.key,
    required this.pageCount,
    required this.currentPage,
  });

  final int pageCount;
  final double currentPage;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final dot = (width * 0.018).clamp(6.0, 7.5);
    final activeW = (width * 0.055).clamp(20.0, 26.0);
    final gap = (width * 0.015).clamp(5.0, 7.0);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(pageCount, (index) {
        final distance = (currentPage - index).abs().clamp(0.0, 1.0);
        final t = Curves.easeOut.transform(1.0 - distance);
        final w = dot + (activeW - dot) * t;
        final color = Color.lerp(
          AppColors.indicatorInactive,
          AppColors.blueBright,
          t,
        )!;

        return Container(
          margin: EdgeInsets.symmetric(horizontal: gap / 2),
          width: w,
          height: dot,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(dot),
          ),
        );
      }),
    );
  }
}
