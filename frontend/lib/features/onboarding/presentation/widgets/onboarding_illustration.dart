import 'package:flutter/material.dart';

import '../../data/onboarding_page_data.dart';
import 'illustrations/efficiency_illustration.dart';
import 'illustrations/security_illustration.dart';
import 'illustrations/welcome_illustration.dart';

/// One shared, aspect-ratio-preserving illustration container.
///
/// All onboarding slides use this exact container so their illustrations have
/// the same visual bounds. No mockups, screenshots, or cropped imagery are
/// used here.
class OnboardingIllustration extends StatelessWidget {
  const OnboardingIllustration({super.key, required this.image});

  final OnboardingIllustrationType image;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AspectRatio(
        aspectRatio: 1.25,
        child: CustomPaint(
          painter: _painterFor(image),
          child: const SizedBox.expand(),
        ),
      ),
    );
  }

  CustomPainter _painterFor(OnboardingIllustrationType type) {
    return switch (type) {
      OnboardingIllustrationType.welcome => WelcomeIllustrationPainter(),
      OnboardingIllustrationType.efficiency => EfficiencyIllustrationPainter(),
      OnboardingIllustrationType.security => SecurityIllustrationPainter(),
    };
  }
}
