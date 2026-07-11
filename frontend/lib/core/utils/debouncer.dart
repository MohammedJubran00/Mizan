import 'dart:async';

/// Debounces rapid invocations — cancel previous pending callback.
class Debouncer {
  Debouncer({this.delay = const Duration(milliseconds: 350)});

  final Duration delay;
  Timer? _timer;

  void run(void Function() action) {
    _timer?.cancel();
    _timer = Timer(delay, action);
  }

  void cancel() {
    _timer?.cancel();
    _timer = null;
  }

  void dispose() => cancel();
}

/// Async debounce that cancels obsolete futures (newest wins).
class AsyncDebouncer {
  AsyncDebouncer({this.delay = const Duration(milliseconds: 350)});

  final Duration delay;
  Timer? _timer;
  int _generation = 0;

  Future<T?> run<T>(Future<T> Function() action) {
    final completer = Completer<T?>();
    final generation = ++_generation;
    _timer?.cancel();
    _timer = Timer(delay, () async {
      if (generation != _generation) {
        completer.complete(null);
        return;
      }
      try {
        final result = await action();
        if (generation != _generation) {
          completer.complete(null);
          return;
        }
        completer.complete(result);
      } catch (e, st) {
        if (!completer.isCompleted) {
          completer.completeError(e, st);
        }
      }
    });
    return completer.future;
  }

  void cancel() {
    _generation++;
    _timer?.cancel();
    _timer = null;
  }

  void dispose() => cancel();
}
