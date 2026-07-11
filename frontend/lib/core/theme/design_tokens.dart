import 'package:flutter/material.dart';

/// Reusable design tokens — spacing, radius, motion, elevation, typography scales.
/// Future themes should only change [ThemeData] / extensions; widgets read tokens.
@immutable
abstract final class DesignTokens {
  // ── Spacing ──────────────────────────────────────────────────────────────
  static const double space2 = 2;
  static const double space4 = 4;
  static const double space8 = 8;
  static const double space12 = 12;
  static const double space16 = 16;
  static const double space20 = 20;
  static const double space24 = 24;
  static const double space32 = 32;
  static const double space40 = 40;
  static const double space48 = 48;

  // ── Border radius ────────────────────────────────────────────────────────
  static const double radiusSm = 10;
  static const double radiusMd = 14;
  static const double radiusLg = 20;
  static const double radiusXl = 24;
  static const double radiusFull = 999;

  // ── Icon sizes ───────────────────────────────────────────────────────────
  static const double iconSm = 16;
  static const double iconMd = 20;
  static const double iconLg = 24;
  static const double iconXl = 28;

  // ── Elevation / shadow ───────────────────────────────────────────────────
  static const double elevationCard = 0;
  static const double shadowBlur = 24;
  static const Offset shadowOffset = Offset(0, 8);

  // ── Animation durations ──────────────────────────────────────────────────
  static const Duration durationFast = Duration(milliseconds: 180);
  static const Duration durationNormal = Duration(milliseconds: 320);
  static const Duration durationSlow = Duration(milliseconds: 480);
  static const Duration durationChart = Duration(milliseconds: 720);
  static const Duration durationPage = Duration(milliseconds: 360);
  static const Duration durationSkeleton = Duration(milliseconds: 1200);
  static const Duration durationRefreshPoll = Duration(seconds: 60);

  // ── Curves ───────────────────────────────────────────────────────────────
  static const Curve curveStandard = Curves.easeOutCubic;
  static const Curve curveEmphasized = Curves.easeOutBack;

  // ── Chart layout ─────────────────────────────────────────────────────────
  static const double chartHeightCompact = 200;
  static const double chartHeightRegular = 260;
  static const double chartHeightTall = 300;
  static const double chartLegendDot = 8;

  // ── Card ─────────────────────────────────────────────────────────────────
  static const EdgeInsets cardPadding = EdgeInsets.all(space20);
  static const double cardMinHeight = 120;
}

/// Semantic status token keys used with [MizanThemeExtension].
enum StatusTone { success, warning, error, information }
