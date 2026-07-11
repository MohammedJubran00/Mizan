import 'package:flutter/material.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/app_colors.dart';
import 'onboarding_page_indicator.dart';

/// Shared bottom section. Its geometry is identical for every onboarding slide.
class OnboardingBottomBar extends StatelessWidget {
  const OnboardingBottomBar({
    super.key,
    required this.pageCount,
    required this.currentPage,
    required this.buttonLabel,
    required this.onPressed,
  });

  final int pageCount;
  final double currentPage;
  final String buttonLabel;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final buttonHeight = AppDimensions.buttonHeight(size);
    final radius = AppDimensions.buttonRadius(size);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        OnboardingPageIndicator(pageCount: pageCount, currentPage: currentPage),
        SizedBox(height: (size.height * 0.025).clamp(14, 22)),
        _ActionButton(
          label: buttonLabel,
          height: buttonHeight,
          radius: radius,
          onPressed: onPressed,
        ),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.label,
    required this.height,
    required this.radius,
    required this.onPressed,
  });

  final String label;
  final double height;
  final double radius;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    const background = AppColors.blueBright;

    final child = Container(
      height: height,
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(radius),
        boxShadow: [
          BoxShadow(
            color: background.withValues(alpha: 0.22),
            blurRadius: 20,
            spreadRadius: 0,
            offset: const Offset(0, 10),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(radius),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 28),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  label,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: AppColors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.1,
                  ),
                ),
                const SizedBox(width: 10),
                Icon(
                  Icons.arrow_forward_rounded,
                  color: AppColors.white,
                  size: height * 0.36,
                ),
              ],
            ),
          ),
        ),
      ),
    );

    return SizedBox(width: double.infinity, child: child);
  }
}
