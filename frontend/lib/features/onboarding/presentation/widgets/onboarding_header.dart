import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_logo.dart';

/// Top bar with Mizan logo mark + brand name and Skip.
class OnboardingHeader extends StatelessWidget {
  const OnboardingHeader({
    super.key,
    required this.onSkip,
    this.showSkip = true,
  });

  final VoidCallback onSkip;
  final bool showSkip;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final logoSize = AppDimensions.logoSize(size);

    return SizedBox(
      height: logoSize * 1.15,
      child: Row(
        children: [
          AppLogo(markSize: logoSize),
          const Spacer(),
          AnimatedOpacity(
            opacity: showSkip ? 1 : 0,
            duration: const Duration(milliseconds: 220),
            child: IgnorePointer(
              ignoring: !showSkip,
              child: TextButton(
                onPressed: onSkip,
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.textMuted,
                  padding: EdgeInsets.symmetric(
                    horizontal: logoSize * 0.15,
                    vertical: logoSize * 0.15,
                  ),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  AppStrings.skip,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: logoSize * 0.38,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textMuted,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
