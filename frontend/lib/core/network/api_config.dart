import 'package:flutter/foundation.dart';

/// Central API configuration. Business logic stays on the server.
abstract final class ApiConfig {
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 20);

  /// Android emulator reaches the host via 10.0.2.2; others use localhost.
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000';
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:3000';
      default:
        return 'http://localhost:3000';
    }
  }
}
