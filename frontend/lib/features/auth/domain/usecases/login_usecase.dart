import '../repositories/auth_repository.dart';

class LoginUseCase {
  const LoginUseCase(this._repository);

  final AuthRepository _repository;

  Future<AuthSession> call({
    required String email,
    required String password,
    Object? cancelToken,
  }) {
    return _repository.login(
      email: email,
      password: password,
      cancelToken: cancelToken,
    );
  }
}
