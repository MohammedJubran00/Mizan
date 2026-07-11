class ApiException implements Exception {
  const ApiException({
    required this.message,
    this.statusCode,
    this.errors,
  });

  final String message;
  final int? statusCode;
  final List<String>? errors;

  @override
  String toString() => message;
}
