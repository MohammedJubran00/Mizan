import '../entities/user_entity.dart';

class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.user,
  });

  final String accessToken;
  final UserEntity user;
}

class RegisterResult {
  const RegisterResult({required this.message});

  final String message;
}

abstract class AuthRepository {
  Future<RegisterResult> register({
    required String fullName,
    required String email,
    required String password,
    Object? cancelToken,
  });

  Future<AuthSession> login({
    required String email,
    required String password,
    Object? cancelToken,
  });
}
