import '../../../core/network/api_client.dart';
import '../../../core/storage/token_storage.dart';
import '../data/datasources/auth_remote_datasource.dart';
import '../data/repositories/auth_repository_impl.dart';
import '../domain/repositories/auth_repository.dart';
import '../domain/usecases/login_usecase.dart';
import '../domain/usecases/register_usecase.dart';

/// Lightweight composition root for the auth feature.
class AuthDependencyContainer {
  AuthDependencyContainer._({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.tokenStorage,
  });

  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final TokenStorage tokenStorage;

  static AuthDependencyContainer? _instance;

  static AuthDependencyContainer get instance {
    return _instance ??= _create();
  }

  static AuthDependencyContainer _create() {
    final apiClient = ApiClient();
    final tokenStorage = TokenStorage();
    final remote = AuthRemoteDataSourceImpl(apiClient);
    final AuthRepository repository = AuthRepositoryImpl(
      remoteDataSource: remote,
      tokenStorage: tokenStorage,
    );

    return AuthDependencyContainer._(
      loginUseCase: LoginUseCase(repository),
      registerUseCase: RegisterUseCase(repository),
      tokenStorage: tokenStorage,
    );
  }

  /// Test / hot-restart helper.
  static void reset() => _instance = null;
}
