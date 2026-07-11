import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/theme/app_colors.dart';

/// Compact search field used in the dashboard app bar.
class DashboardSearchBar extends StatelessWidget {
  const DashboardSearchBar({
    super.key,
    this.controller,
    this.onChanged,
    this.hintText = AppStrings.searchPlaceholder,
  });

  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final String hintText;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final width = AppDimensions.searchBarWidth(size);
    final height = AppDimensions.appBarHeight(size) * 0.58;
    final radius = height * 0.35;

    return SizedBox(
      width: width,
      height: height,
      child: TextField(
        controller: controller,
        onChanged: onChanged,
        style: GoogleFonts.plusJakartaSans(
          fontSize: height * 0.36,
          fontWeight: FontWeight.w500,
          color: AppColors.textPrimary,
        ),
        decoration: InputDecoration(
          isDense: true,
          hintText: hintText,
          hintStyle: GoogleFonts.plusJakartaSans(
            fontSize: height * 0.36,
            fontWeight: FontWeight.w400,
            color: AppColors.textMuted,
          ),
          prefixIcon: Icon(
            Icons.search_rounded,
            size: height * 0.48,
            color: AppColors.textMuted,
          ),
          filled: true,
          fillColor: AppColors.inputFill,
          contentPadding: EdgeInsets.symmetric(vertical: height * 0.2),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(radius),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(radius),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(radius),
            borderSide: BorderSide(
              color: AppColors.gold.withValues(alpha: 0.55),
              width: 1.2,
            ),
          ),
        ),
      ),
    );
  }
}
