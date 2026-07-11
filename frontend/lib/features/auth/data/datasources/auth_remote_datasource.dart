import 'package:dio/dio.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../models/user_model.dart';

class RegisterResponse {
  const RegisterResponse({required this.message});

  final String message;
}

class LoginWorkspaceModel {
  const LoginWorkspaceModel({
    required this.id,
    required this.name,
    required this.role,
  });

  final String id;
  final String name;
  final String role;

  factory LoginWorkspaceModel.fromJson(Map<String, dynamic> json) {
    return LoginWorkspaceModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Workspace',
      role: json['role'] as String? ?? 'MEMBER',
    );
  }
}

class LoginResponse {
  const LoginResponse({
    required this.accessToken,
    required this.user,
    required this.workspace,
  });

  final String accessToken;
  final UserModel user;
  final LoginWorkspaceModel workspace;
}

abstract class AuthRemoteDataSource {
  Future<RegisterResponse> register({
    required String fullName,
    required String email,
    required String password,
    CancelToken? cancelToken,
  });

  Future<LoginResponse> login({
    required String email,
    required String password,
    CancelToken? cancelToken,
  });
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  AuthRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<RegisterResponse> register({
    required String fullName,
    required String email,
    required String password,
    CancelToken? cancelToken,
  }) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiEndpoints.register,
      data: {
        'fullName': fullName,
        'email': email,
        'password': password,
      },
      cancelToken: cancelToken,
    );

    final data = response.data ?? const <String, dynamic>{};
    return RegisterResponse(
      message: data['message'] as String? ?? 'Account created successfully.',
    );
  }

  @override
  Future<LoginResponse> login({
    required String email,
    required String password,
    CancelToken? cancelToken,
  }) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiEndpoints.login,
      data: {
        'email': email,
        'password': password,
      },
      cancelToken: cancelToken,
    );

    final data = response.data ?? const <String, dynamic>{};
    final userJson = data['user'] as Map<String, dynamic>;
    final workspaceJson =
        data['workspace'] as Map<String, dynamic>? ?? const <String, dynamic>{};

    return LoginResponse(
      accessToken: data['accessToken'] as String,
      user: UserModel.fromJson(userJson),
      workspace: LoginWorkspaceModel.fromJson(workspaceJson),
    );
  }
}
