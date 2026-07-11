import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Persists the JWT securely. UI never inspects token contents.
class TokenStorage {
  TokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const _accessTokenKey = 'mizan_access_token';

  final FlutterSecureStorage _storage;

  Future<void> saveAccessToken(String token) {
    return _storage.write(key: _accessTokenKey, value: token);
  }

  Future<String?> readAccessToken() {
    return _storage.read(key: _accessTokenKey);
  }

  Future<void> clear() {
    return _storage.delete(key: _accessTokenKey);
  }
}
