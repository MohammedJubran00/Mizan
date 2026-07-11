import 'package:dio/dio.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../models/user_model.dart';

class RegisterResponse {
  const RegisterResponse({required this.message});

  final String message;
}

class LoginResponse {
  const LoginResponse({
    required this.accessToken,
    required this.user,
  });

  final String accessToken;
  final UserModel user;
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

    return LoginResponse(
      accessToken: data['accessToken'] as String,
      user: UserModel.fromJson(userJson),
    );
  }
}
