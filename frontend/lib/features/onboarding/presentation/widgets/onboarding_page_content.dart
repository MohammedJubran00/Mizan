import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/onboarding_page_data.dart';
import 'onboarding_bottom_bar.dart';
import 'onboarding_illustration.dart';

/// The single reusable visual layout for every onboarding slide.
///
/// Only its image and copy change between pages; illustration bounds,
/// typography, spacing, indicator placement, and button placement are shared.
class OnboardingPageContent extends StatelessWidget {
  const OnboardingPageContent({
    super.key,
    required this.image,
    required this.title,
    required this.description,
    required this.buttonText,
    required this.pageCount,
    required this.currentPage,
    required this.onPressed,
  });

  final OnboardingIllustrationType image;
  final String title;
  final String description;
  final String buttonText;
  final int pageCount;
  final double currentPage;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final screen = MediaQuery.sizeOf(context);
        final titleSize = AppDimensions.titleFontSize(screen);
        final bodySize = AppDimensions.bodyFontSize(screen);

        return LayoutBuilder(
          builder: (context, pageConstraints) {
            final height = pageConstraints.maxHeight;

            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // PageView sits below the header, so this is ~40–45% of the
                // full screen on common phone, tablet, and desktop sizes.
                SizedBox(
                  height: height * 0.5,
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: constraints.maxWidth * 0.02,
                    ),
                    child: OnboardingIllustration(image: image),
                  ),
                ),
                SizedBox(height: AppDimensions.illustrationToTitle(screen)),
                SizedBox(
                  height: height * 0.115,
                  child: Center(
                    child: Text(
                      title,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: titleSize,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                        height: 1.18,
                        letterSpacing: -0.4,
                      ),
                    ),
                  ),
                ),
                SizedBox(height: AppDimensions.titleToDescription(screen)),
                SizedBox(
                  height: height * 0.16,
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: constraints.maxWidth * 0.04,
                      ),
                      child: Text(
                        description,
                        textAlign: TextAlign.center,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: bodySize,
                          fontWeight: FontWeight.w400,
                          color: AppColors.textSecondary,
                          height: 1.55,
                        ),
                      ),
                    ),
                  ),
                ),
                const Spacer(),
                OnboardingBottomBar(
                  pageCount: pageCount,
                  currentPage: currentPage,
                  buttonLabel: buttonText,
                  onPressed: onPressed,
                ),
              ],
            );
          },
        );
      },
    );
  }
}
