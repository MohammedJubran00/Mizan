class ApiException implements Exception {
  const ApiException({
    required this.message,
    this.statusCode,
    this.errors,
    this.offline = false,
  });

  final String message;
  final int? statusCode;
  final List<String>? errors;
  final bool offline;

  @override
  String toString() => message;
}
