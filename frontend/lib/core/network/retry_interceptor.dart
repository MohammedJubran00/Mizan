import 'dart:math' as math;

import 'package:dio/dio.dart';

/// Retries idempotent GET requests with exponential backoff.
/// Skips cancel, 4xx (except 408/429), and non-GET methods.
class RetryInterceptor extends Interceptor {
  RetryInterceptor({
    this.maxRetries = 2,
    this.baseDelay = const Duration(milliseconds: 400),
  });

  final int maxRetries;
  final Duration baseDelay;

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final request = err.requestOptions;
    final attempt = (request.extra['retryAttempt'] as int?) ?? 0;

    if (!_shouldRetry(err, attempt)) {
      handler.next(err);
      return;
    }

    final delay = baseDelay * math.pow(2, attempt).toInt();
    await Future<void>.delayed(delay);

    try {
      request.extra['retryAttempt'] = attempt + 1;
      final response = await Dio(
        BaseOptions(
          baseUrl: request.baseUrl,
          connectTimeout: request.connectTimeout,
          receiveTimeout: request.receiveTimeout,
          headers: request.headers,
        ),
      ).fetch(request);
      handler.resolve(response);
    } on DioException catch (e) {
      handler.next(e);
    }
  }

  bool _shouldRetry(DioException err, int attempt) {
    if (attempt >= maxRetries) return false;
    if (err.type == DioExceptionType.cancel) return false;
    if (err.requestOptions.method.toUpperCase() != 'GET') return false;

    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return true;
      case DioExceptionType.badResponse:
        final code = err.response?.statusCode ?? 0;
        return code == 408 || code == 429 || code >= 500;
      default:
        return false;
    }
  }
}
