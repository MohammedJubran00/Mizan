import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

import '../../../../../core/theme/app_colors.dart';

/// Top ornament of the balance scale stand.
enum ScaleTop { finial, gears }

/// Anchor points produced while drawing the scale so callers can place
/// content (dashboards, clouds, shields, …) precisely on the pans.
class BalanceScaleMetrics {
  const BalanceScaleMetrics({
    required this.scale,
    required this.center,
    required this.beamY,
    required this.fulcrum,
    required this.leftPan,
    required this.rightPan,
  });

  /// Normalized unit (illustration was authored at height 240).
  final double scale;
  final Offset center;
  final double beamY;
  final Offset fulcrum;

  /// Top-center of each gold bowl — the spot content should rest on.
  final Offset leftPan;
  final Offset rightPan;
}

/// Shared drawing utilities for the premium navy + gold legal illustrations.
///
/// Everything here is pure vector (no raster assets, no baked-in text), so the
/// same visual language scales cleanly across every onboarding screen.
mixin OnboardingPainterMixin on CustomPainter {
  // ---- Paints ---------------------------------------------------------------

  Paint get navyFill => Paint()
    ..color = AppColors.navy
    ..style = PaintingStyle.fill;

  Paint outline(double s, {double alpha = 0.5}) => Paint()
    ..color = AppColors.navy.withValues(alpha: alpha)
    ..style = PaintingStyle.stroke
    ..strokeWidth = 1.6 * s
    ..strokeCap = StrokeCap.round
    ..strokeJoin = StrokeJoin.round;

  Paint get navyStroke => Paint()
    ..color = AppColors.navy.withValues(alpha: 0.55)
    ..style = PaintingStyle.stroke
    ..strokeWidth = 1.8
    ..strokeCap = StrokeCap.round
    ..strokeJoin = StrokeJoin.round;

  Paint goldFill([double opacity = 1, Rect? bounds]) {
    final rect = bounds ?? const Rect.fromLTWH(0, 0, 80, 80);
    return Paint()
      ..shader = ui.Gradient.linear(
        rect.topLeft,
        rect.bottomRight,
        [
          AppColors.goldLight.withValues(alpha: opacity),
          AppColors.gold.withValues(alpha: opacity),
          AppColors.goldDark.withValues(alpha: opacity),
        ],
        const [0.0, 0.5, 1.0],
      );
  }

  Paint solidGold([double opacity = 1]) => Paint()
    ..color = AppColors.gold.withValues(alpha: opacity)
    ..style = PaintingStyle.fill;

  // ---- Shared helpers -------------------------------------------------------

  void drawSoftShadow(Canvas canvas, Offset center, double radius) {
    final shadow = Paint()
      ..color = AppColors.navy.withValues(alpha: 0.12)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 16);
    canvas.drawOval(
      Rect.fromCenter(
        center: center.translate(0, radius * 0.12),
        width: radius * 2.4,
        height: radius * 0.5,
      ),
      shadow,
    );
  }

  void drawCenteredText(
    Canvas canvas,
    String text,
    Offset center, {
    required double fontSize,
    required Color color,
    FontWeight weight = FontWeight.w700,
    double letterSpacing = 0.6,
  }) {
    final tp = TextPainter(
      text: TextSpan(
        text: text,
        style: TextStyle(
          color: color,
          fontSize: fontSize,
          fontWeight: weight,
          letterSpacing: letterSpacing,
          height: 1.05,
        ),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(
      canvas,
      Offset(center.dx - tp.width / 2, center.dy - tp.height / 2),
    );
  }

  // ---- Balance scale --------------------------------------------------------

  /// Draws the premium scale of justice and returns anchor metrics.
  BalanceScaleMetrics paintBalanceScale(
    Canvas canvas,
    Offset baseCenter, {
    required double height,
    ScaleTop top = ScaleTop.finial,
  }) {
    final scale = height / 240;
    final cx = baseCenter.dx;
    final by = baseCenter.dy;

    drawSoftShadow(canvas, Offset(cx, by), 48 * scale);

    // Stacked pedestal base.
    _rrect(
      canvas,
      cx,
      by - 4 * scale,
      104 * scale,
      12 * scale,
      6 * scale,
      navyFill,
    );
    _rrect(
      canvas,
      cx,
      by - 15 * scale,
      78 * scale,
      13 * scale,
      6 * scale,
      navyFill,
    );
    final accent = Rect.fromCenter(
      center: Offset(cx, by - 23 * scale),
      width: 54 * scale,
      height: 4 * scale,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(accent, Radius.circular(2 * scale)),
      goldFill(1, accent),
    );

    // Vertical stand with a slim gold highlight.
    final fulcrumY = by - 172 * scale;
    final pillarBottom = by - 26 * scale;
    final pillarRect = Rect.fromCenter(
      center: Offset(cx, (fulcrumY + pillarBottom) / 2),
      width: 18 * scale,
      height: pillarBottom - fulcrumY,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(pillarRect, Radius.circular(6 * scale)),
      navyFill,
    );
    // Slim gold accent on the stand. Skipped for the gears variant so it
    // cannot show through the efficiency banner caption as a yellow fringe.
    if (top == ScaleTop.finial) {
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromCenter(
            center: Offset(cx - 3 * scale, (fulcrumY + pillarBottom) / 2),
            width: 3 * scale,
            height: pillarBottom - fulcrumY - 14 * scale,
          ),
          Radius.circular(scale),
        ),
        Paint()..color = AppColors.gold.withValues(alpha: 0.7),
      );
    }

    // Beam + central gold hub.
    final beamY = fulcrumY + 2 * scale;
    const beamHalf = 94.0;
    _rrect(
      canvas,
      cx,
      beamY,
      beamHalf * 2 * scale,
      9 * scale,
      4 * scale,
      navyFill,
    );
    final hubRect = Rect.fromCircle(
      center: Offset(cx, beamY),
      radius: 8 * scale,
    );
    canvas.drawCircle(Offset(cx, beamY), 8 * scale, goldFill(1, hubRect));

    // Top ornament.
    switch (top) {
      case ScaleTop.finial:
        _drawFinial(canvas, Offset(cx, fulcrumY), scale);
      case ScaleTop.gears:
        paintGear(canvas, Offset(cx, fulcrumY - 8 * scale), 20 * scale);
        paintGear(
          canvas,
          Offset(cx + 20 * scale, fulcrumY + 4 * scale),
          12 * scale,
        );
    }

    // Hang points + pans.
    final hangL = Offset(cx - beamHalf * scale, beamY);
    final hangR = Offset(cx + beamHalf * scale, beamY);
    canvas.drawCircle(hangL, 3 * scale, navyFill);
    canvas.drawCircle(hangR, 3 * scale, navyFill);
    final leftPan = _drawPan(canvas, hangL, scale);
    final rightPan = _drawPan(canvas, hangR, scale);

    return BalanceScaleMetrics(
      scale: scale,
      center: Offset(cx, by),
      beamY: beamY,
      fulcrum: Offset(cx, fulcrumY),
      leftPan: leftPan,
      rightPan: rightPan,
    );
  }

  void _drawFinial(Canvas canvas, Offset fulcrum, double scale) {
    final path = Path()
      ..moveTo(fulcrum.dx, fulcrum.dy - 26 * scale)
      ..quadraticBezierTo(
        fulcrum.dx + 8 * scale,
        fulcrum.dy - 8 * scale,
        fulcrum.dx,
        fulcrum.dy + 2 * scale,
      )
      ..quadraticBezierTo(
        fulcrum.dx - 8 * scale,
        fulcrum.dy - 8 * scale,
        fulcrum.dx,
        fulcrum.dy - 26 * scale,
      )
      ..close();
    canvas.drawPath(path, goldFill(1, path.getBounds()));
  }

  /// Draws a suspended gold bowl and returns its top-center anchor.
  Offset _drawPan(Canvas canvas, Offset hangPoint, double scale) {
    final panY = hangPoint.dy + 66 * scale;
    const halfTop = 30.0;

    final string = Paint()
      ..color = AppColors.navy.withValues(alpha: 0.85)
      ..strokeWidth = 1.8 * scale
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(
      hangPoint,
      Offset(hangPoint.dx - (halfTop - 5) * scale, panY),
      string,
    );
    canvas.drawLine(
      hangPoint,
      Offset(hangPoint.dx + (halfTop - 5) * scale, panY),
      string,
    );

    final bowl = Path()
      ..moveTo(hangPoint.dx - halfTop * scale, panY)
      ..quadraticBezierTo(
        hangPoint.dx,
        panY + 26 * scale,
        hangPoint.dx + halfTop * scale,
        panY,
      )
      ..quadraticBezierTo(
        hangPoint.dx,
        panY + 8 * scale,
        hangPoint.dx - halfTop * scale,
        panY,
      )
      ..close();
    canvas.drawPath(bowl, goldFill(1, bowl.getBounds()));
    canvas.drawLine(
      Offset(hangPoint.dx - halfTop * scale, panY),
      Offset(hangPoint.dx + halfTop * scale, panY),
      Paint()
        ..color = AppColors.goldDark
        ..strokeWidth = 2 * scale
        ..strokeCap = StrokeCap.round,
    );

    return Offset(hangPoint.dx, panY);
  }

  void _rrect(
    Canvas canvas,
    double cx,
    double cy,
    double w,
    double h,
    double r,
    Paint paint,
  ) {
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(cx, cy), width: w, height: h),
        Radius.circular(r),
      ),
      paint,
    );
  }

  // ---- Screen 1 ornaments ---------------------------------------------------

  /// Elegant open book rendered as clean navy line-art with a gold ribbon.
  void paintOpenBook(Canvas canvas, Offset center, double size) {
    final s = size / 80;
    final cx = center.dx;
    final cy = center.dy;
    final stroke = outline(s, alpha: 0.55);
    final top = cy - 22 * s;
    final bottom = cy + 20 * s;

    Path page(int dir) {
      return Path()
        ..moveTo(cx, top)
        ..quadraticBezierTo(
          cx + dir * 24 * s,
          top - 8 * s,
          cx + dir * 42 * s,
          top + 4 * s,
        )
        ..lineTo(cx + dir * 42 * s, bottom - 4 * s)
        ..quadraticBezierTo(cx + dir * 24 * s, bottom - 12 * s, cx, bottom);
    }

    canvas.drawPath(page(-1), stroke);
    canvas.drawPath(page(1), stroke);
    canvas.drawLine(Offset(cx, top), Offset(cx, bottom), stroke);

    // Page ruling lines.
    for (var i = 1; i <= 3; i++) {
      final y = top + 6 * s + i * 7 * s;
      canvas.drawLine(
        Offset(cx - 34 * s, y),
        Offset(cx - 8 * s, y - 2 * s),
        outline(s, alpha: 0.3),
      );
      canvas.drawLine(
        Offset(cx + 8 * s, y - 2 * s),
        Offset(cx + 34 * s, y),
        outline(s, alpha: 0.3),
      );
    }

    // Gold bookmark ribbon.
    final ribbon = Path()
      ..moveTo(cx - 5 * s, top + 2 * s)
      ..lineTo(cx - 5 * s, top + 22 * s)
      ..lineTo(cx, top + 16 * s)
      ..lineTo(cx + 5 * s, top + 22 * s)
      ..lineTo(cx + 5 * s, top + 2 * s)
      ..close();
    canvas.drawPath(ribbon, goldFill(1, ribbon.getBounds()));
  }

  /// Classical fluted courthouse column (navy line-art).
  void paintColumn(Canvas canvas, Offset origin, double size) {
    final s = size / 96;
    final cx = origin.dx;
    final top = origin.dy;
    final stroke = outline(s, alpha: 0.5);

    for (final tier in const <List<double>>[
      [46, 6, 3],
      [36, 5, 9],
      [28, 5, 14],
    ]) {
      _rrect(
        canvas,
        cx,
        top + tier[2] * s,
        tier[0] * s,
        tier[1] * s,
        1.5 * s,
        stroke,
      );
    }

    final shaft = Rect.fromLTWH(cx - 12 * s, top + 17 * s, 24 * s, 60 * s);
    canvas.drawRRect(
      RRect.fromRectAndRadius(shaft, Radius.circular(2 * s)),
      stroke,
    );
    for (var i = -1; i <= 1; i++) {
      canvas.drawLine(
        Offset(cx + i * 6 * s, top + 22 * s),
        Offset(cx + i * 6 * s, top + 72 * s),
        Paint()
          ..color = AppColors.gold.withValues(alpha: 0.5)
          ..strokeWidth = 1.1 * s,
      );
    }

    for (final tier in const <List<double>>[
      [30, 5, 80],
      [42, 6, 86],
      [52, 7, 93],
    ]) {
      _rrect(
        canvas,
        cx,
        top + tier[2] * s,
        tier[0] * s,
        tier[1] * s,
        1.5 * s,
        stroke,
      );
    }
  }

  // ---- Reusable icon motifs (screens 2 & 3) --------------------------------

  void paintDashboard(Canvas canvas, Offset center, double size) {
    final s = size / 48;
    final rect = Rect.fromCenter(center: center, width: 46 * s, height: 38 * s);
    final rrect = RRect.fromRectAndRadius(rect, Radius.circular(6 * s));
    canvas.drawRRect(rrect, navyFill);
    canvas.drawRRect(
      RRect.fromRectAndRadius(rect.deflate(3 * s), Radius.circular(4 * s)),
      Paint()..color = AppColors.white,
    );

    final bars = [0.4, 0.7, 0.55, 0.9];
    final barWidth = 5 * s;
    final gap = 4 * s;
    final startX = center.dx - (bars.length * (barWidth + gap) - gap) / 2;
    final baseY = center.dy + 11 * s;
    for (var i = 0; i < bars.length; i++) {
      final h = 20 * s * bars[i];
      final x = startX + i * (barWidth + gap);
      final barRect = Rect.fromLTWH(x, baseY - h, barWidth, h);
      canvas.drawRRect(
        RRect.fromRectAndRadius(barRect, Radius.circular(1.5 * s)),
        i.isEven ? navyFill : goldFill(1, barRect),
      );
    }
    // Rising trend line.
    final line = Path()
      ..moveTo(center.dx - 15 * s, center.dy - 4 * s)
      ..lineTo(center.dx - 5 * s, center.dy - 8 * s)
      ..lineTo(center.dx + 5 * s, center.dy - 6 * s)
      ..lineTo(center.dx + 15 * s, center.dy - 12 * s);
    canvas.drawPath(
      line,
      Paint()
        ..color = AppColors.blueBright
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.6 * s
        ..strokeJoin = StrokeJoin.round,
    );
  }

  void paintGear(Canvas canvas, Offset center, double radius) {
    final path = Path();
    const teeth = 8;
    final inner = radius * 0.74;
    for (var i = 0; i < teeth; i++) {
      final a0 = (i / teeth) * math.pi * 2;
      final a1 = ((i + 0.32) / teeth) * math.pi * 2;
      final a2 = ((i + 0.68) / teeth) * math.pi * 2;
      final a3 = ((i + 1) / teeth) * math.pi * 2;
      if (i == 0) {
        path.moveTo(
          center.dx + math.cos(a0) * inner,
          center.dy + math.sin(a0) * inner,
        );
      }
      path
        ..lineTo(
          center.dx + math.cos(a0) * radius,
          center.dy + math.sin(a0) * radius,
        )
        ..lineTo(
          center.dx + math.cos(a1) * radius,
          center.dy + math.sin(a1) * radius,
        )
        ..lineTo(
          center.dx + math.cos(a1) * inner,
          center.dy + math.sin(a1) * inner,
        )
        ..lineTo(
          center.dx + math.cos(a2) * inner,
          center.dy + math.sin(a2) * inner,
        )
        ..lineTo(
          center.dx + math.cos(a2) * radius,
          center.dy + math.sin(a2) * radius,
        )
        ..lineTo(
          center.dx + math.cos(a3) * radius,
          center.dy + math.sin(a3) * radius,
        )
        ..lineTo(
          center.dx + math.cos(a3) * inner,
          center.dy + math.sin(a3) * inner,
        );
    }
    path.close();
    final bounds = Rect.fromCircle(center: center, radius: radius);
    canvas.drawPath(path, goldFill(1, bounds));
    canvas.drawCircle(center, radius * 0.34, navyFill);
    canvas.drawCircle(center, radius * 0.16, goldFill(1, bounds));
  }

  void paintCloud(Canvas canvas, Offset center, double size) {
    final s = size / 56;
    final cloud = Path()
      ..addOval(
        Rect.fromCenter(
          center: center.translate(-11 * s, 4 * s),
          width: 30 * s,
          height: 24 * s,
        ),
      )
      ..addOval(
        Rect.fromCenter(
          center: center.translate(11 * s, 4 * s),
          width: 32 * s,
          height: 26 * s,
        ),
      )
      ..addOval(
        Rect.fromCenter(
          center: center.translate(0, -6 * s),
          width: 36 * s,
          height: 30 * s,
        ),
      );
    canvas.drawPath(cloud, Paint()..color = AppColors.blueSoft);
    canvas.drawPath(cloud, navyStroke..strokeWidth = 1.6 * s);
  }

  void paintLock(Canvas canvas, Offset center, double size) {
    final s = size / 28;
    final body = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: center.translate(0, 4 * s),
        width: 20 * s,
        height: 16 * s,
      ),
      Radius.circular(3 * s),
    );
    canvas.drawRRect(body, goldFill(1, body.outerRect));
    canvas.drawArc(
      Rect.fromCenter(
        center: center.translate(0, -4 * s),
        width: 14 * s,
        height: 14 * s,
      ),
      math.pi,
      math.pi,
      false,
      Paint()
        ..color = AppColors.navy
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.6 * s
        ..strokeCap = StrokeCap.round,
    );
    canvas.drawCircle(center.translate(0, 4 * s), 2.2 * s, navyFill);
  }

  void paintShield(Canvas canvas, Offset center, double size) {
    final s = size / 64;
    final path = Path()
      ..moveTo(center.dx, center.dy - 30 * s)
      ..cubicTo(
        center.dx + 28 * s,
        center.dy - 26 * s,
        center.dx + 26 * s,
        center.dy + 8 * s,
        center.dx,
        center.dy + 32 * s,
      )
      ..cubicTo(
        center.dx - 26 * s,
        center.dy + 8 * s,
        center.dx - 28 * s,
        center.dy - 26 * s,
        center.dx,
        center.dy - 30 * s,
      )
      ..close();
    canvas.drawPath(path, Paint()..color = AppColors.blueSoft);
    canvas.drawPath(path, navyStroke..strokeWidth = 2.2 * s);

    final check = Path()
      ..moveTo(center.dx - 9 * s, center.dy + 1 * s)
      ..lineTo(center.dx - 2 * s, center.dy + 9 * s)
      ..lineTo(center.dx + 12 * s, center.dy - 10 * s);
    canvas.drawPath(
      check,
      Paint()
        ..color = AppColors.gold
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.4 * s
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );
  }

  void paintDocument(Canvas canvas, Offset center, double size) {
    final s = size / 40;
    final rect = Rect.fromCenter(center: center, width: 32 * s, height: 42 * s);
    final doc = RRect.fromRectAndRadius(rect, Radius.circular(4 * s));
    canvas.drawRRect(doc, Paint()..color = AppColors.white);
    canvas.drawRRect(doc, outline(s, alpha: 0.45));
    for (var i = 0; i < 3; i++) {
      canvas.drawLine(
        Offset(rect.left + 6 * s, rect.top + (12 + i * 8) * s),
        Offset(rect.right - 6 * s, rect.top + (12 + i * 8) * s),
        Paint()
          ..color = AppColors.navy.withValues(alpha: 0.22)
          ..strokeWidth = 1.5 * s,
      );
    }
    final tag = Rect.fromLTWH(
      rect.left + 6 * s,
      rect.top + 6 * s,
      12 * s,
      3 * s,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(tag, Radius.circular(s)),
      solidGold(0.9),
    );
  }

  /// Navy ribbon banner with centered white caption (screen 2).
  void paintBanner(
    Canvas canvas,
    Offset center,
    double width,
    double scale,
    String text,
  ) {
    final h = 30 * scale;
    final halfW = width / 2;
    final tip = 11 * scale;

    // Single opaque ribbon shape — no stroke, no gold accents.
    final ribbon = Path()
      ..moveTo(center.dx - halfW, center.dy - h / 2)
      ..lineTo(center.dx + halfW, center.dy - h / 2)
      ..lineTo(center.dx + halfW + tip, center.dy)
      ..lineTo(center.dx + halfW, center.dy + h / 2)
      ..lineTo(center.dx - halfW, center.dy + h / 2)
      ..lineTo(center.dx - halfW - tip, center.dy)
      ..close();
    canvas.drawPath(
      ribbon,
      Paint()
        ..color = AppColors.navy
        ..style = PaintingStyle.fill
        ..isAntiAlias = true,
    );

    final tp = TextPainter(
      text: TextSpan(
        text: text,
        style: TextStyle(
          color: AppColors.white,
          fontSize: 15 * scale,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.2,
          height: 1,
          decoration: TextDecoration.none,
          shadows: const [],
        ),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(
      canvas,
      Offset(center.dx - tp.width / 2, center.dy - tp.height / 2),
    );
  }
}
