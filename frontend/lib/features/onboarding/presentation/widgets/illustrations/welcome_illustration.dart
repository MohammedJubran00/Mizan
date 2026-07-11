import 'package:flutter/material.dart';

import 'onboarding_painter_mixin.dart';

/// Screen 1 — premium scale of justice flanked by legal books (left) and a
/// classical courthouse pillar (right). Recreated from the reference in vector.
class WelcomeIllustrationPainter extends CustomPainter
    with OnboardingPainterMixin {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width * 0.5;
    final baseY = size.height * 0.9;
    final scaleH = size.height * 0.8;
    final unit = size.shortestSide;

    // Legal books on the left.
    paintOpenBook(
      canvas,
      Offset(size.width * 0.12, size.height * 0.34),
      unit * 0.3,
    );

    // Twin courthouse pillars on the right.
    paintColumn(
      canvas,
      Offset(size.width * 0.82, size.height * 0.2),
      unit * 0.34,
    );
    paintColumn(
      canvas,
      Offset(size.width * 0.92, size.height * 0.24),
      unit * 0.3,
    );

    // Central scale.
    paintBalanceScale(canvas, Offset(cx, baseY), height: scaleH);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
