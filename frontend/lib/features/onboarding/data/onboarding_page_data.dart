enum OnboardingIllustrationType { welcome, efficiency, security }

/// Immutable content for a single onboarding page.
class OnboardingPageData {
  const OnboardingPageData({
    required this.title,
    required this.description,
    required this.image,
    required this.buttonLabel,
  });

  final String title;
  final String description;

  /// The illustration shown in the shared onboarding image container.
  final OnboardingIllustrationType image;
  final String buttonLabel;
}

/// Static onboarding content (UI-only, no backend).
abstract final class OnboardingContent {
  static const List<OnboardingPageData> pages = [
    OnboardingPageData(
      title: 'Welcome to Mizan',
      description:
          'Manage cases, clients, appointments, and legal documents from one '
          'secure platform built for modern law firms.',
      image: OnboardingIllustrationType.welcome,
      buttonLabel: 'Next',
    ),
    OnboardingPageData(
      title: 'Practice Law Efficiently',
      description:
          'Increase productivity, collaborate securely, organize your legal '
          'workflow, and focus on what matters most.',
      image: OnboardingIllustrationType.efficiency,
      buttonLabel: 'Next',
    ),
    OnboardingPageData(
      title: 'Secure. Reliable. Professional.',
      description:
          'Your legal data is protected with enterprise-grade security, '
          'encrypted storage, and reliable cloud synchronization wherever you work.',
      image: OnboardingIllustrationType.security,
      buttonLabel: 'Get Started',
    ),
  ];
}
