/// Applies an optimistic local change, then syncs with the backend.
/// Rolls back if [commit] fails.
class OptimisticUpdate<T> {
  OptimisticUpdate({
    required this.read,
    required this.write,
  });

  final T Function() read;
  final void Function(T value) write;

  Future<R> run<R>({
    required T optimistic,
    required Future<R> Function() commit,
  }) async {
    final previous = read();
    write(optimistic);
    try {
      return await commit();
    } catch (_) {
      write(previous);
      rethrow;
    }
  }
}
