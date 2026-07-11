import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

/// Material 3 theme configured for the Mizan brand.
abstract final class AppTheme {
  static ThemeData get light {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.blue,
      primary: AppColors.blueBright,
      secondary: AppColors.gold,
      surface: AppColors.white,
      brightness: Brightness.light,
    );

    final displayFont = GoogleFonts.playfairDisplayTextTheme();
    final bodyFont = GoogleFonts.plusJakartaSansTextTheme();

    final textTheme = bodyFont.copyWith(
      displayLarge: displayFont.displayLarge?.copyWith(
        color: AppColors.navy,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
      ),
      displayMedium: displayFont.displayMedium?.copyWith(
        color: AppColors.navy,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.4,
      ),
      displaySmall: displayFont.displaySmall?.copyWith(
        color: AppColors.navy,
        fontWeight: FontWeight.w700,
      ),
      headlineLarge: displayFont.headlineLarge?.copyWith(
        color: AppColors.textPrimary,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.3,
      ),
      headlineMedium: displayFont.headlineMedium?.copyWith(
        color: AppColors.textPrimary,
        fontWeight: FontWeight.w700,
      ),
      headlineSmall: displayFont.headlineSmall?.copyWith(
        color: AppColors.textPrimary,
        fontWeight: FontWeight.w700,
      ),
      titleLarge: bodyFont.titleLarge?.copyWith(
        color: AppColors.textPrimary,
        fontWeight: FontWeight.w700,
      ),
      titleMedium: bodyFont.titleMedium?.copyWith(
        color: AppColors.textPrimary,
        fontWeight: FontWeight.w600,
      ),
      bodyLarge: bodyFont.bodyLarge?.copyWith(
        color: AppColors.textSecondary,
        height: 1.55,
        fontWeight: FontWeight.w400,
      ),
      bodyMedium: bodyFont.bodyMedium?.copyWith(
        color: AppColors.textSecondary,
        height: 1.5,
      ),
      labelLarge: bodyFont.labelLarge?.copyWith(
        fontWeight: FontWeight.w600,
        letterSpacing: 0.2,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.background,
      textTheme: textTheme,
      splashFactory: InkSparkle.splashFactory,
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.blueBright,
          foregroundColor: AppColors.white,
          disabledBackgroundColor: AppColors.indicatorInactive,
          disabledForegroundColor: AppColors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.textMuted,
          textStyle: bodyFont.labelLarge?.copyWith(
            fontWeight: FontWeight.w500,
            fontSize: 15,
          ),
        ),
      ),
    );
  }
}
