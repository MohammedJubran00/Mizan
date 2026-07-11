import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_logo.dart';

class AuthHeader extends StatelessWidget {
  const AuthHeader({
    super.key,
    required this.title,
    required this.subtitle,
  });

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final titleSize = AppDimensions.authTitleFontSize(size);
    final subtitleSize = AppDimensions.authSubtitleFontSize(size);
    final gap = AppDimensions.authSectionGap(size) * 0.55;
    final logoSize = AppDimensions.authLogoSize(size);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: AppLogo(markSize: logoSize),
        ),
        SizedBox(height: gap * 1.35),
        Text(
          title,
          style: GoogleFonts.plusJakartaSans(
            fontSize: titleSize,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
            letterSpacing: -0.5,
            height: 1.15,
          ),
        ),
        SizedBox(height: gap * 0.45),
        Text(
          subtitle,
          style: GoogleFonts.plusJakartaSans(
            fontSize: subtitleSize,
            fontWeight: FontWeight.w400,
            color: AppColors.textSecondary,
            height: 1.45,
          ),
        ),
      ],
    );
  }
}
