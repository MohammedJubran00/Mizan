import 'package:flutter/material.dart';

/// Design tokens for dashboard surfaces — always resolve via Theme, never hardcode in widgets.
@immutable
class MizanThemeExtension extends ThemeExtension<MizanThemeExtension> {
  const MizanThemeExtension({
    required this.accent,
    required this.accentSoft,
    required this.contentBackground,
    required this.cardBackground,
    required this.cardBorder,
    required this.sidebarBackground,
    required this.sidebarSurface,
    required this.sidebarBorder,
    required this.sidebarText,
    required this.sidebarMuted,
    required this.sidebarHover,
    required this.sidebarSelected,
    required this.success,
    required this.warning,
    required this.danger,
    required this.info,
    required this.skeletonBase,
    required this.skeletonHighlight,
    required this.shadow,
  });

  final Color accent;
  final Color accentSoft;
  final Color contentBackground;
  final Color cardBackground;
  final Color cardBorder;
  final Color sidebarBackground;
  final Color sidebarSurface;
  final Color sidebarBorder;
  final Color sidebarText;
  final Color sidebarMuted;
  final Color sidebarHover;
  final Color sidebarSelected;
  final Color success;
  final Color warning;
  final Color danger;
  final Color info;
  final Color skeletonBase;
  final Color skeletonHighlight;
  final Color shadow;

  static const light = MizanThemeExtension(
    accent: Color(0xFFEAB308),
    accentSoft: Color(0x1AEAB308),
    contentBackground: Color(0xFFF7F8FA),
    cardBackground: Color(0xFFFFFFFF),
    cardBorder: Color(0xFFE8EAEE),
    sidebarBackground: Color(0xFF0B1424),
    sidebarSurface: Color(0xFF111C30),
    sidebarBorder: Color(0xFF1C2A42),
    sidebarText: Color(0xFFF3F4F6),
    sidebarMuted: Color(0xFF8B95A8),
    sidebarHover: Color(0x14FFFFFF),
    sidebarSelected: Color(0x1AEAB308),
    success: Color(0xFF16A34A),
    warning: Color(0xFFEA580C),
    danger: Color(0xFFDC2626),
    info: Color(0xFF2563EB),
    skeletonBase: Color(0xFFE8EAEE),
    skeletonHighlight: Color(0xFFF3F4F6),
    shadow: Color(0x14000000),
  );

  static const dark = MizanThemeExtension(
    accent: Color(0xFFEAB308),
    accentSoft: Color(0x24EAB308),
    contentBackground: Color(0xFF0A0A0A),
    cardBackground: Color(0xFF141414),
    cardBorder: Color(0xFF2A2A2A),
    sidebarBackground: Color(0xFF000000),
    sidebarSurface: Color(0xFF111111),
    sidebarBorder: Color(0xFF222222),
    sidebarText: Color(0xFFF5F5F5),
    sidebarMuted: Color(0xFF9CA3AF),
    sidebarHover: Color(0x14FFFFFF),
    sidebarSelected: Color(0x24EAB308),
    success: Color(0xFF22C55E),
    warning: Color(0xFFF97316),
    danger: Color(0xFFEF4444),
    info: Color(0xFF3B82F6),
    skeletonBase: Color(0xFF1F1F1F),
    skeletonHighlight: Color(0xFF2A2A2A),
    shadow: Color(0x40000000),
  );

  @override
  MizanThemeExtension copyWith({
    Color? accent,
    Color? accentSoft,
    Color? contentBackground,
    Color? cardBackground,
    Color? cardBorder,
    Color? sidebarBackground,
    Color? sidebarSurface,
    Color? sidebarBorder,
    Color? sidebarText,
    Color? sidebarMuted,
    Color? sidebarHover,
    Color? sidebarSelected,
    Color? success,
    Color? warning,
    Color? danger,
    Color? info,
    Color? skeletonBase,
    Color? skeletonHighlight,
    Color? shadow,
  }) {
    return MizanThemeExtension(
      accent: accent ?? this.accent,
      accentSoft: accentSoft ?? this.accentSoft,
      contentBackground: contentBackground ?? this.contentBackground,
      cardBackground: cardBackground ?? this.cardBackground,
      cardBorder: cardBorder ?? this.cardBorder,
      sidebarBackground: sidebarBackground ?? this.sidebarBackground,
      sidebarSurface: sidebarSurface ?? this.sidebarSurface,
      sidebarBorder: sidebarBorder ?? this.sidebarBorder,
      sidebarText: sidebarText ?? this.sidebarText,
      sidebarMuted: sidebarMuted ?? this.sidebarMuted,
      sidebarHover: sidebarHover ?? this.sidebarHover,
      sidebarSelected: sidebarSelected ?? this.sidebarSelected,
      success: success ?? this.success,
      warning: warning ?? this.warning,
      danger: danger ?? this.danger,
      info: info ?? this.info,
      skeletonBase: skeletonBase ?? this.skeletonBase,
      skeletonHighlight: skeletonHighlight ?? this.skeletonHighlight,
      shadow: shadow ?? this.shadow,
    );
  }

  @override
  MizanThemeExtension lerp(ThemeExtension<MizanThemeExtension>? other, double t) {
    if (other is! MizanThemeExtension) return this;
    return MizanThemeExtension(
      accent: Color.lerp(accent, other.accent, t)!,
      accentSoft: Color.lerp(accentSoft, other.accentSoft, t)!,
      contentBackground: Color.lerp(contentBackground, other.contentBackground, t)!,
      cardBackground: Color.lerp(cardBackground, other.cardBackground, t)!,
      cardBorder: Color.lerp(cardBorder, other.cardBorder, t)!,
      sidebarBackground: Color.lerp(sidebarBackground, other.sidebarBackground, t)!,
      sidebarSurface: Color.lerp(sidebarSurface, other.sidebarSurface, t)!,
      sidebarBorder: Color.lerp(sidebarBorder, other.sidebarBorder, t)!,
      sidebarText: Color.lerp(sidebarText, other.sidebarText, t)!,
      sidebarMuted: Color.lerp(sidebarMuted, other.sidebarMuted, t)!,
      sidebarHover: Color.lerp(sidebarHover, other.sidebarHover, t)!,
      sidebarSelected: Color.lerp(sidebarSelected, other.sidebarSelected, t)!,
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      danger: Color.lerp(danger, other.danger, t)!,
      info: Color.lerp(info, other.info, t)!,
      skeletonBase: Color.lerp(skeletonBase, other.skeletonBase, t)!,
      skeletonHighlight: Color.lerp(skeletonHighlight, other.skeletonHighlight, t)!,
      shadow: Color.lerp(shadow, other.shadow, t)!,
    );
  }
}

extension MizanThemeX on BuildContext {
  MizanThemeExtension get mizanTheme =>
      Theme.of(this).extension<MizanThemeExtension>() ?? MizanThemeExtension.light;
}
