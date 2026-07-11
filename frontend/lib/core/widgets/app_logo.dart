import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../constants/app_dimensions.dart';
import '../constants/app_strings.dart';
import '../theme/app_colors.dart';

/// Visual surface the logo sits on — drives mark tile and wordmark colors.
enum AppLogoTone {
  /// Light backgrounds (auth, onboarding).
  onLight,

  /// Dark surfaces (dashboard sidebar).
  onDark,
}

/// Official Mizan brand mark used across the app.
///
/// White rounded tile + navy/gold scales + bold sans-serif wordmark.
class AppLogo extends StatelessWidget {
  const AppLogo({
    super.key,
    this.markSize,
    this.showWordmark = true,
    this.tone = AppLogoTone.onLight,
  });

  /// Outer size of the icon tile. Defaults to responsive [AppDimensions.logoSize].
  final double? markSize;

  final bool showWordmark;

  final AppLogoTone tone;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final resolvedMark = markSize ?? AppDimensions.logoSize(size);
    final gap = resolvedMark * 0.3;
    final fontSize = resolvedMark * 0.48;
    final isDark = tone == AppLogoTone.onDark;

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        _MizanMark(size: resolvedMark, onDark: isDark),
        if (showWordmark) ...[
          SizedBox(width: gap),
          Text(
            AppStrings.appName,
            style: GoogleFonts.plusJakartaSans(
              color: isDark ? AppColors.sidebarText : AppColors.textPrimary,
              fontWeight: FontWeight.w700,
              fontSize: fontSize,
              letterSpacing: -0.3,
              height: 1,
            ),
          ),
        ],
      ],
    );
  }
}

class _MizanMark extends StatelessWidget {
  const _MizanMark({required this.size, required this.onDark});

  final double size;
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: onDark ? AppColors.gold : AppColors.white,
        borderRadius: BorderRadius.circular(size * 0.26),
        border: onDark
            ? null
            : Border.all(color: AppColors.divider, width: 1),
        boxShadow: [
          BoxShadow(
            color: AppColors.navy.withValues(alpha: onDark ? 0.25 : 0.05),
            blurRadius: onDark ? 12 : 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: CustomPaint(
        painter: MizanScalesPainter(onGold: onDark),
      ),
    );
  }
}

/// Flat navy + gold scales of justice matching the brand asset.
class MizanScalesPainter extends CustomPainter {
  const MizanScalesPainter({this.onGold = false});

  /// When true, paints navy scales on a gold tile (sidebar brand mark).
  final bool onGold;

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width * 0.5;
    final primary = Paint()
      ..color = onGold ? AppColors.navyDeep : AppColors.navy
      ..style = PaintingStyle.fill;
    final accent = Paint()
      ..color = onGold ? AppColors.navyDeep : AppColors.gold
      ..style = PaintingStyle.fill;

    // Base
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(cx, size.height * 0.82),
          width: size.width * 0.42,
          height: size.height * 0.08,
        ),
        Radius.circular(size.width * 0.04),
      ),
      onGold ? primary : accent,
    );

    // Pillar
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(cx, size.height * 0.52),
          width: size.width * 0.08,
          height: size.height * 0.42,
        ),
        Radius.circular(size.width * 0.02),
      ),
      primary,
    );

    // Beam
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(cx, size.height * 0.30),
          width: size.width * 0.62,
          height: size.height * 0.06,
        ),
        Radius.circular(size.width * 0.02),
      ),
      primary,
    );

    // Top knob
    canvas.drawCircle(
      Offset(cx, size.height * 0.22),
      size.width * 0.06,
      onGold ? primary : accent,
    );

    final panPaint = Paint()
      ..color = onGold ? AppColors.navyDeep : AppColors.gold
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.045
      ..strokeCap = StrokeCap.round;

    for (final dx in [-0.28, 0.28]) {
      final hx = cx + size.width * dx;
      final hy = size.height * 0.30;
      canvas.drawLine(
        Offset(hx, hy),
        Offset(hx, size.height * 0.48),
        Paint()
          ..color = (onGold ? AppColors.navyDeep : AppColors.navy)
              .withValues(alpha: 0.7)
          ..strokeWidth = size.width * 0.025,
      );
      canvas.drawArc(
        Rect.fromCenter(
          center: Offset(hx, size.height * 0.52),
          width: size.width * 0.22,
          height: size.height * 0.14,
        ),
        0.15,
        2.85,
        false,
        panPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant MizanScalesPainter oldDelegate) =>
      oldDelegate.onGold != onGold;
}
