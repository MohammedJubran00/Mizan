import '../../../../core/storage/session_storage.dart';
import '../entities/user_entity.dart';

class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.user,
    required this.workspace,
  });

  final String accessToken;
  final UserEntity user;
  final WorkspaceSession workspace;
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
