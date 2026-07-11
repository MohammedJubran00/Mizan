import 'package:flutter/material.dart';

import 'onboarding_painter_mixin.dart';

/// Screen 2 — productivity scale: automation gears at the fulcrum, an analytics
/// dashboard on one pan and a secure cloud on the other, over a labelled ribbon.
class EfficiencyIllustrationPainter extends CustomPainter
    with OnboardingPainterMixin {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width * 0.5;
    final baseY = size.height * 0.9;
    final scaleH = size.height * 0.8;

    final metrics = paintBalanceScale(
      canvas,
      Offset(cx, baseY),
      height: scaleH,
      top: ScaleTop.gears,
    );

    final s = metrics.scale;

    // Analytics dashboard resting on the left pan.
    paintDashboard(canvas, metrics.leftPan.translate(0, -20 * s), 44 * s);

    // Secure cloud + lock resting on the right pan.
    paintCloud(canvas, metrics.rightPan.translate(0, -22 * s), 46 * s);
    paintLock(canvas, metrics.rightPan.translate(0, -20 * s), 20 * s);

    // Central caption ribbon, sitting in clear space above the base.
    paintBanner(
      canvas,
      Offset(cx, baseY - 62 * s),
      190 * s,
      s,
      'LAW PRACTICE EFFICIENCY',
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
