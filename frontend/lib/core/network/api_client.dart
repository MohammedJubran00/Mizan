import 'package:dio/dio.dart';

import '../storage/session_storage.dart';
import '../storage/token_storage.dart';
import 'api_config.dart';
import 'api_exception.dart';

/// Thin Dio wrapper — no business logic, only transport.
class ApiClient {
  ApiClient({
    Dio? dio,
    String? baseUrl,
    TokenStorage? tokenStorage,
    SessionStorage? sessionStorage,
  })  : _tokenStorage = tokenStorage ?? TokenStorage(),
        _sessionStorage = sessionStorage ?? SessionStorage(),
        _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: baseUrl ?? ApiConfig.baseUrl,
                connectTimeout: ApiConfig.connectTimeout,
                receiveTimeout: ApiConfig.receiveTimeout,
                headers: const {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
              ),
            ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.readAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          final workspace = await _sessionStorage.readWorkspace();
          if (workspace != null && workspace.id.isNotEmpty) {
            options.headers['X-Workspace-Id'] = workspace.id;
          }
          handler.next(options);
        },
      ),
    );
  }

  final Dio _dio;
  final TokenStorage _tokenStorage;
  final SessionStorage _sessionStorage;

  Dio get dio => _dio;

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _mapDioException(e);
    }
  }

  Future<Response<T>> post<T>(
    String path, {
    Object? data,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _mapDioException(e);
    }
  }

  ApiException _mapDioException(DioException e) {
    if (e.type == DioExceptionType.cancel) {
      return const ApiException(message: 'Request cancelled.');
    }

    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return const ApiException(
        message: 'Connection timed out. Please try again.',
      );
    }

    if (e.type == DioExceptionType.connectionError) {
      return const ApiException(
        message: 'Unable to reach the server. Check your connection.',
      );
    }

    final data = e.response?.data;
    String message = 'Something went wrong. Please try again.';
    List<String>? errors;

    if (data is Map<String, dynamic>) {
      final rawMessage = data['message'];
      if (rawMessage is String && rawMessage.isNotEmpty) {
        message = rawMessage;
      }

      final rawErrors = data['errors'];
      if (rawErrors is List) {
        errors = rawErrors
            .map((item) {
              if (item is Map && item['message'] is String) {
                return item['message'] as String;
              }
              return item.toString();
            })
            .toList();
        if (errors.isNotEmpty && message == 'Validation failed.') {
          message = errors.first;
        }
      }
    }

    return ApiException(
      message: message,
      statusCode: e.response?.statusCode,
      errors: errors,
    );
  }
}
