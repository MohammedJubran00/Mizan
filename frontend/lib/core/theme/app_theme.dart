import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';
import 'design_tokens.dart';
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
    final secondaryText =
        isDark ? const Color(0xFFB0B0B0) : AppColors.textSecondary;

    final textTheme = bodyFont
        .apply(
          bodyColor: secondaryText,
          displayColor: primaryText,
        )
        .copyWith(
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

    final radiusLg = BorderRadius.circular(DesignTokens.radiusLg);
    final radiusMd = BorderRadius.circular(DesignTokens.radiusMd);

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: ext.contentBackground,
      textTheme: textTheme,
      extensions: [ext],
      splashFactory: InkSparkle.splashFactory,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.windows: FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.macOS: FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.linux: FadeUpwardsPageTransitionsBuilder(),
        },
      ),
      cardTheme: CardThemeData(
        color: ext.cardBackground,
        elevation: DesignTokens.elevationCard,
        shape: RoundedRectangleBorder(
          borderRadius: radiusLg,
          side: BorderSide(color: ext.cardBorder),
        ),
      ),
      dividerTheme: DividerThemeData(color: ext.cardBorder, thickness: 1),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: ext.accent,
          foregroundColor: Colors.black,
          shape: RoundedRectangleBorder(borderRadius: radiusMd),
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: ext.accent,
          foregroundColor: Colors.black,
          shape: RoundedRectangleBorder(borderRadius: radiusMd),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryText,
          side: BorderSide(color: ext.cardBorder),
          shape: RoundedRectangleBorder(borderRadius: radiusMd),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryText,
          shape: RoundedRectangleBorder(borderRadius: radiusMd),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? ext.sidebarSurface : ext.contentBackground,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(DesignTokens.radiusSm),
          borderSide: BorderSide(color: ext.cardBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(DesignTokens.radiusSm),
          borderSide: BorderSide(color: ext.cardBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(DesignTokens.radiusSm),
          borderSide: BorderSide(color: ext.accent, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(DesignTokens.radiusSm),
          borderSide: BorderSide(color: ext.danger),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: isDark ? ext.sidebarSurface : const Color(0xFF0B1424),
        contentTextStyle: TextStyle(color: ext.sidebarText),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: radiusMd),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: ext.cardBackground,
        shape: RoundedRectangleBorder(borderRadius: radiusLg),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: ext.cardBackground,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(DesignTokens.radiusXl),
          ),
        ),
      ),
      popupMenuTheme: PopupMenuThemeData(
        color: ext.cardBackground,
        shape: RoundedRectangleBorder(borderRadius: radiusMd),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: ext.accentSoft,
        selectedColor: ext.accent,
        labelStyle: TextStyle(color: primaryText, fontWeight: FontWeight.w600),
        side: BorderSide.none,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(DesignTokens.radiusFull),
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
