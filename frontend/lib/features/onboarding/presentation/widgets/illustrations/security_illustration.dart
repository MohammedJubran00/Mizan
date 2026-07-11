import 'package:flutter/material.dart';

import 'onboarding_painter_mixin.dart';

/// Screen 3 — security scale: a protective shield on one pan, a secure cloud
/// with a lock on the other, and encrypted legal documents at the base.
class SecurityIllustrationPainter extends CustomPainter
    with OnboardingPainterMixin {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width * 0.5;
    final baseY = size.height * 0.9;
    final scaleH = size.height * 0.8;

    // Supporting legal documents behind the base, balanced on both sides.
    paintDocument(
      canvas,
      Offset(size.width * 0.14, size.height * 0.6),
      size.shortestSide * 0.16,
    );
    paintDocument(
      canvas,
      Offset(size.width * 0.86, size.height * 0.62),
      size.shortestSide * 0.14,
    );

    final metrics = paintBalanceScale(
      canvas,
      Offset(cx, baseY),
      height: scaleH,
    );

    final s = metrics.scale;

    // Shield resting on the left pan.
    paintShield(canvas, metrics.leftPan.translate(0, -24 * s), 44 * s);

    // Secure cloud + lock resting on the right pan.
    paintCloud(canvas, metrics.rightPan.translate(0, -22 * s), 46 * s);
    paintLock(canvas, metrics.rightPan.translate(0, -20 * s), 20 * s);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
