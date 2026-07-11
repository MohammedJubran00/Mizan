import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';
import 'mizan_theme_extension.dart';

/// Material 3 themes — light (white + yellow) and dark (black + yellow).
abstract final class AppTheme {
  static ThemeData get light {
    final ext = MizanThemeExtension.light;
    final colorScheme = ColorScheme.light(
      primary: ext.accent,
      onPrimary: Colors.black,
      secondary: ext.accent,
      onSecondary: Colors.black,
      surface: ext.cardBackground,
      onSurface: AppColors.textPrimary,
      error: ext.danger,
      onError: Colors.white,
      outline: ext.cardBorder,
    );
    return _build(brightness: Brightness.light, colorScheme: colorScheme, ext: ext);
  }

  static ThemeData get dark {
    final ext = MizanThemeExtension.dark;
    final colorScheme = ColorScheme.dark(
      primary: ext.accent,
      onPrimary: Colors.black,
      secondary: ext.accent,
      onSecondary: Colors.black,
      surface: ext.cardBackground,
      onSurface: const Color(0xFFF5F5F5),
      error: ext.danger,
      onError: Colors.white,
      outline: ext.cardBorder,
    );
    return _build(brightness: Brightness.dark, colorScheme: colorScheme, ext: ext);
  }

  static ThemeData _build({
    required Brightness brightness,
    required ColorScheme colorScheme,
    required MizanThemeExtension ext,
  }) {
    final isDark = brightness == Brightness.dark;
    final displayFont = GoogleFonts.playfairDisplayTextTheme();
    final bodyFont = GoogleFonts.plusJakartaSansTextTheme();
    final primaryText = colorScheme.onSurface;
    final secondaryText = isDark ? const Color(0xFFB0B0B0) : AppColors.textSecondary;

    final textTheme = bodyFont.apply(
      bodyColor: secondaryText,
      displayColor: primaryText,
    ).copyWith(
      displayLarge: displayFont.displayLarge?.copyWith(
        color: primaryText,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
      ),
      displayMedium: displayFont.displayMedium?.copyWith(
        color: primaryText,
        fontWeight: FontWeight.w700,
      ),
      headlineLarge: displayFont.headlineLarge?.copyWith(
        color: primaryText,
        fontWeight: FontWeight.w700,
      ),
      headlineMedium: displayFont.headlineMedium?.copyWith(
        color: primaryText,
        fontWeight: FontWeight.w700,
      ),
      headlineSmall: displayFont.headlineSmall?.copyWith(
        color: primaryText,
        fontWeight: FontWeight.w700,
      ),
      titleLarge: bodyFont.titleLarge?.copyWith(
        color: primaryText,
        fontWeight: FontWeight.w700,
      ),
      titleMedium: bodyFont.titleMedium?.copyWith(
        color: primaryText,
        fontWeight: FontWeight.w600,
      ),
      bodyLarge: bodyFont.bodyLarge?.copyWith(
        color: secondaryText,
        height: 1.55,
      ),
      bodyMedium: bodyFont.bodyMedium?.copyWith(
        color: secondaryText,
        height: 1.5,
      ),
      labelLarge: bodyFont.labelLarge?.copyWith(
        fontWeight: FontWeight.w600,
        letterSpacing: 0.2,
        color: primaryText,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: ext.contentBackground,
      textTheme: textTheme,
      extensions: [ext],
      splashFactory: InkSparkle.splashFactory,
      cardTheme: CardThemeData(
        color: ext.cardBackground,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: ext.cardBorder),
        ),
      ),
      dividerTheme: DividerThemeData(color: ext.cardBorder, thickness: 1),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: ext.accent,
          foregroundColor: Colors.black,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
        ),
      ),
      iconTheme: IconThemeData(color: secondaryText),
      appBarTheme: AppBarTheme(
        backgroundColor: ext.cardBackground,
        foregroundColor: primaryText,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
    );
  }
}
