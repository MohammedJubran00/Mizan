import 'package:flutter/material.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/onboarding_page_data.dart';
import '../widgets/onboarding_header.dart';
import '../widgets/onboarding_page_content.dart';

/// Premium 3-screen onboarding flow (UI only).
///
/// Navigation beyond this screen is intentionally left to [onSkip] /
/// [onGetStarted] placeholders — no auth or backend is wired here.
class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key, this.onSkip, this.onGetStarted});

  /// Placeholder callback when the user taps Skip.
  final VoidCallback? onSkip;

  /// Placeholder callback when the user taps Get Started on the final page.
  final VoidCallback? onGetStarted;

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _controller = PageController();
  double _page = 0;

  int get _pageCount => OnboardingContent.pages.length;
  int get _currentIndex => _page.round().clamp(0, _pageCount - 1);
  bool get _isFinalPage => _currentIndex == _pageCount - 1;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onScroll);
  }

  void _onScroll() {
    setState(() => _page = _controller.page ?? 0);
  }

  @override
  void dispose() {
    _controller
      ..removeListener(_onScroll)
      ..dispose();
    super.dispose();
  }

  Future<void> _goNext() async {
    if (_isFinalPage) {
      widget.onGetStarted?.call();
      return;
    }
    await _controller.nextPage(
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOutCubic,
    );
  }

  void _onSkip() {
    widget.onSkip?.call();
  }

  @override
  Widget build(BuildContext context) {
    final pages = OnboardingContent.pages;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final size = Size(constraints.maxWidth, constraints.maxHeight);
            final padding = AppDimensions.pagePadding(size);

            return Align(
              alignment: Alignment.topCenter,
              child: ConstrainedBox(
                constraints: const BoxConstraints(
                  maxWidth: AppDimensions.maxContentWidth,
                ),
                child: Padding(
                  padding: padding,
                  child: Column(
                    children: [
                      OnboardingHeader(onSkip: _onSkip),
                      SizedBox(
                        height: AppDimensions.headerToIllustration(size),
                      ),
                      Expanded(
                        child: PageView.builder(
                          controller: _controller,
                          itemCount: pages.length,
                          physics: const BouncingScrollPhysics(),
                          itemBuilder: (context, index) {
                            return AnimatedBuilder(
                              animation: _controller,
                              builder: (context, child) {
                                var opacity = 1.0;
                                var dx = 0.0;
                                if (_controller.position.haveDimensions) {
                                  final delta = (_controller.page ?? 0) - index;
                                  opacity = (1 - delta.abs() * 0.45).clamp(
                                    0.35,
                                    1.0,
                                  );
                                  dx = delta * 12;
                                }
                                return Opacity(
                                  opacity: opacity,
                                  child: Transform.translate(
                                    offset: Offset(dx, 0),
                                    child: child,
                                  ),
                                );
                              },
                              child: OnboardingPageContent(
                                image: pages[index].image,
                                title: pages[index].title,
                                description: pages[index].description,
                                buttonText: pages[index].buttonLabel,
                                pageCount: _pageCount,
                                currentPage: _page,
                                onPressed: _goNext,
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
