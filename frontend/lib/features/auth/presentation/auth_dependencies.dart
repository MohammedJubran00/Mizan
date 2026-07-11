import '../../../core/network/api_client.dart';
import '../../../core/storage/token_storage.dart';
import '../../dashboard/presentation/dashboard_dependencies.dart';
import '../data/datasources/auth_remote_datasource.dart';
import '../data/repositories/auth_repository_impl.dart';
import '../domain/repositories/auth_repository.dart';
import '../domain/usecases/login_usecase.dart';
import '../domain/usecases/register_usecase.dart';

/// Lightweight composition root for the auth feature.
/// Delegates shared clients to [AppDependencies] when available.
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
    final app = AppDependencies.instance;
    return AuthDependencyContainer._(
      loginUseCase: app.loginUseCase,
      registerUseCase: app.registerUseCase,
      tokenStorage: app.tokenStorage,
    );
  }

  /// Standalone create for tests that avoid the full app graph.
  static AuthDependencyContainer createStandalone() {
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
