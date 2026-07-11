import '../repositories/auth_repository.dart';

class RegisterUseCase {
  const RegisterUseCase(this._repository);

  final AuthRepository _repository;

  Future<RegisterResult> call({
    required String fullName,
    required String email,
    required String password,
    Object? cancelToken,
  }) {
    return _repository.register(
      fullName: fullName,
      email: email,
      password: password,
      cancelToken: cancelToken,
    );
  }
}
