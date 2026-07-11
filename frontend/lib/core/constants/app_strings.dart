/// Shared copy / brand strings.
abstract final class AppStrings {
  static const String appName = 'Mizan';
  static const String skip = 'Skip';
  static const String next = 'Next';
  static const String getStarted = 'Get Started';

  // Auth — Login
  static const String welcomeBack = 'Welcome back';
  static const String loginSubtitle = 'Log in to manage your legal practice.';
  static const String emailAddress = 'Email Address';
  static const String password = 'Password';
  static const String forgotPassword = 'Forgot Password?';
  static const String login = 'Login';
  static const String noAccount = "Don't have an account?";
  static const String signUp = 'Sign Up';

  // Auth — Register
  static const String createAccountTitle = 'Create your account';
  static const String createAccountSubtitle =
      'Join Mizan and manage your legal practice efficiently.';
  static const String fullName = 'Full Name';
  static const String confirmPassword = 'Confirm Password';
  static const String createAccount = 'Create Account';
  static const String haveAccount = 'Already have an account?';
  static const String logIn = 'Log In';
  static const String agreePrefix = 'I agree to the ';
  static const String termsOfService = 'Terms of Service';
  static const String andWord = ' and ';
  static const String privacyPolicy = 'Privacy Policy';

  // Placeholders
  static const String fullNameHint = 'Johnathan Doe';
  static const String emailHint = 'attorney@mizan.law';

  // Footer
  static const String copyright =
      '© 2024 Mizan Legal Tech. All rights reserved.';
  static const String security = 'Security';

  // Validation (client UX only — server is source of truth)
  static const String fullNameRequired = 'Full name is required.';
  static const String emailRequired = 'Email is required.';
  static const String emailInvalid = 'Please enter a valid email.';
  static const String passwordRequired = 'Password is required.';
  static const String passwordMinLength =
      'Password must be at least 8 characters.';
  static const String passwordsDoNotMatch = 'Passwords do not match.';
  static const String termsRequired =
      'Please agree to the Terms of Service and Privacy Policy.';

  // Dashboard — navigation groups
  static const String workspace = 'Workspace';
  static const String practice = 'Practice';
  static const String administration = 'Administration';

  // Dashboard — nav items
  static const String dashboard = 'Dashboard';
  static const String aiAssistant = 'AI Assistant';
  static const String clients = 'Clients';
  static const String cases = 'Cases';
  static const String hearings = 'Hearings';
  static const String calendar = 'Calendar';
  static const String documents = 'Documents';
  static const String billing = 'Billing';
  static const String reports = 'Reports';
  static const String usersPermissions = 'Users & Permissions';
  static const String securityLogs = 'Security Logs';
  static const String settings = 'Settings';

  // Dashboard — chrome
  static const String searchPlaceholder = 'Search cases, clients…';
  static const String notifications = 'Notifications';
  static const String comingSoon = 'Coming soon';
  static const String emptyStateHint =
      'This section is ready for your practice data.';
  static const String retry = 'Retry';
  static const String loadMore = 'Load more';
  static const String offlineBanner =
      'You appear to be offline. Showing the last available data.';
  static const String recentActivity = 'Recent Activity';
  static const String upcomingHearings = 'Upcoming Hearings';
  static const String deadlines = 'Deadlines';
  static const String noRecentActivity = 'No Recent Activity';
  static const String noHearings = 'No Hearings Scheduled';
  static const String noDeadlines = 'No Deadlines';
  static const String quickActionsSoon = 'Quick actions coming soon.';
}
