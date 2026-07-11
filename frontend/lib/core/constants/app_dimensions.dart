import 'package:flutter/widgets.dart';

/// Responsive spacing and sizing helpers for adaptive layouts.
abstract final class AppDimensions {
  static const double maxContentWidth = 480;
  static const double maxAuthCardWidth = 440;

  static EdgeInsets pagePadding(Size size) {
    final horizontal = _clamp(size.width * 0.06, 22, 40);
    final vertical = _clamp(size.height * 0.012, 8, 20);
    return EdgeInsets.fromLTRB(
      horizontal,
      vertical,
      horizontal,
      vertical * 1.2,
    );
  }

  static EdgeInsets authPagePadding(Size size) {
    final horizontal = _clamp(size.width * 0.06, 20, 48);
    final vertical = _clamp(size.height * 0.03, 16, 40);
    return EdgeInsets.symmetric(horizontal: horizontal, vertical: vertical);
  }

  /// Gap between header and illustration — kept tight like the reference.
  static double headerToIllustration(Size size) =>
      _clamp(size.height * 0.008, 4, 12);

  /// Gap between illustration and title.
  static double illustrationToTitle(Size size) =>
      _clamp(size.height * 0.018, 10, 20);

  /// Gap between title and description.
  static double titleToDescription(Size size) =>
      _clamp(size.height * 0.012, 8, 14);

  /// Gap above the bottom bar.
  static double contentToBottom(Size size) =>
      _clamp(size.height * 0.02, 12, 24);

  static double authSectionGap(Size size) =>
      _clamp(size.height * 0.028, 18, 28);

  static double authFieldGap(Size size) =>
      _clamp(size.height * 0.018, 12, 18);

  static double authCardPadding(Size size) =>
      _clamp(size.width * 0.055, 20, 28);

  static double titleFontSize(Size size) {
    return _clamp(size.width * 0.072, 28, 34);
  }

  static double authTitleFontSize(Size size) {
    return _clamp(size.width * 0.065, 26, 32);
  }

  static double bodyFontSize(Size size) {
    return _clamp(size.width * 0.04, 14.5, 16.5);
  }

  static double authSubtitleFontSize(Size size) {
    return _clamp(size.width * 0.038, 14, 15.5);
  }

  static double buttonHeight(Size size) {
    return _clamp(size.height * 0.068, 54, 60);
  }

  static double authButtonHeight(Size size) {
    return _clamp(size.height * 0.062, 50, 56);
  }

  static double buttonRadius(Size size) {
    return _clamp(size.width * 0.035, 12, 14);
  }

  static double fieldRadius(Size size) {
    return _clamp(size.width * 0.028, 10, 12);
  }

  static double cardRadius(Size size) {
    return _clamp(size.width * 0.04, 14, 18);
  }

  static double logoSize(Size size) {
    return _clamp(size.width * 0.085, 34, 40);
  }

  static double authLogoSize(Size size) {
    return _clamp(size.width * 0.09, 36, 44);
  }

  static double indicatorDot(Size size) => _clamp(size.width * 0.018, 6, 8);

  static double indicatorActiveWidth(Size size) =>
      _clamp(size.width * 0.055, 20, 26);

  /// Fixed sidebar appears from this width upward (tablet landscape / desktop / web).
  static const double sidebarBreakpoint = 900;

  static bool usePersistentSidebar(Size size) => size.width >= sidebarBreakpoint;

  static double sidebarWidth(Size size) => _clamp(size.width * 0.22, 248, 288);

  static double sidebarLogoSize(Size size) => _clamp(size.width * 0.03, 34, 40);

  static EdgeInsets sidebarPadding(Size size) {
    final h = _clamp(size.width * 0.012, 14, 18);
    final v = _clamp(size.height * 0.02, 16, 24);
    return EdgeInsets.fromLTRB(h, v, h, v);
  }

  static double sidebarItemHeight(Size size) =>
      _clamp(size.height * 0.048, 42, 48);

  static double sidebarItemRadius(Size size) =>
      _clamp(size.width * 0.008, 10, 12);

  static EdgeInsets contentPadding(Size size) {
    final h = _clamp(size.width * 0.03, 16, 32);
    final v = _clamp(size.height * 0.025, 16, 28);
    return EdgeInsets.symmetric(horizontal: h, vertical: v);
  }

  static double appBarHeight(Size size) => _clamp(size.height * 0.08, 64, 72);

  static double searchBarWidth(Size size) {
    if (size.width < 600) return size.width * 0.42;
    return _clamp(size.width * 0.22, 200, 320);
  }

  static double _clamp(double value, double min, double max) {
    return value.clamp(min, max).toDouble();
  }
}
