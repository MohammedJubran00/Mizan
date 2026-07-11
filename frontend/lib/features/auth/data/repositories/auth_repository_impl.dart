import 'package:dio/dio.dart';

import '../../../../core/storage/session_storage.dart';
import '../../../../core/storage/token_storage.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({
    required AuthRemoteDataSource remoteDataSource,
    required this.tokenStorage,
  }) : _remote = remoteDataSource;

  final AuthRemoteDataSource _remote;
  final TokenStorage tokenStorage;

  @override
  Future<RegisterResult> register({
    required String fullName,
    required String email,
    required String password,
    Object? cancelToken,
  }) async {
    final response = await _remote.register(
      fullName: fullName,
      email: email,
      password: password,
      cancelToken: cancelToken is CancelToken ? cancelToken : null,
    );

    return RegisterResult(message: response.message);
  }

  @override
  Future<AuthSession> login({
    required String email,
    required String password,
    Object? cancelToken,
  }) async {
    final response = await _remote.login(
      email: email,
      password: password,
      cancelToken: cancelToken is CancelToken ? cancelToken : null,
    );

    await tokenStorage.saveAccessToken(response.accessToken);

    return AuthSession(
      accessToken: response.accessToken,
      user: response.user.toEntity(),
      workspace: WorkspaceSession(
        id: response.workspace.id,
        name: response.workspace.name,
        role: response.workspace.role,
      ),
    );
  }
}
