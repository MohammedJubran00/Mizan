import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/sign_up_page.dart';
import '../../features/dashboard/data/dashboard_nav_data.dart';
import '../../features/dashboard/presentation/pages/dashboard_section_page.dart';
import '../../features/dashboard/presentation/widgets/dashboard_layout.dart';
import '../../features/onboarding/presentation/pages/onboarding_page.dart';

abstract final class AppRoutes {
  static const onboarding = '/';
  static const login = '/login';
  static const signup = '/signup';

  /// Legacy post-login path — redirects to [dashboard].
  static const home = '/home';

  static const dashboard = '/dashboard';
  static const aiAssistant = '/ai-assistant';
  static const clients = '/clients';
  static const cases = '/cases';
  static const hearings = '/hearings';
  static const calendar = '/calendar';
  static const documents = '/documents';
  static const billing = '/billing';
  static const reports = '/reports';
  static const usersPermissions = '/users-permissions';
  static const securityLogs = '/security-logs';
  static const settings = '/settings';
}

GoRouter createAppRouter() {
  return GoRouter(
    initialLocation: AppRoutes.onboarding,
    routes: [
      GoRoute(
        path: AppRoutes.onboarding,
        builder: (context, state) => OnboardingPage(
          onSkip: () => context.go(AppRoutes.login),
          onGetStarted: () => context.go(AppRoutes.signup),
        ),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: AppRoutes.signup,
        builder: (context, state) => const SignUpPage(),
      ),
      GoRoute(
        path: AppRoutes.home,
        redirect: (context, state) => AppRoutes.dashboard,
      ),
      ShellRoute(
        builder: (context, state, child) {
          return DashboardLayout(
            currentPath: state.uri.path,
            child: child,
          );
        },
        routes: [
          for (final destination in DashboardNavData.allDestinations)
            GoRoute(
              path: destination.path,
              pageBuilder: (context, state) => NoTransitionPage(
                key: state.pageKey,
                child: DashboardSectionPage(destination: destination),
              ),
            ),
        ],
      ),
    ],
  );
}
