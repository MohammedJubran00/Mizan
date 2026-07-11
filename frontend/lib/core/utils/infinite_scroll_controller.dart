import 'package:flutter/widgets.dart';

/// Reusable infinite-scroll helper — prevents duplicate loads, supports retry.
class InfiniteScrollController {
  InfiniteScrollController({
    required this.onLoadMore,
    this.threshold = 240,
    this.canLoadMore,
  });

  final Future<void> Function() onLoadMore;
  final double threshold;
  final bool Function()? canLoadMore;

  ScrollController? _bound;
  bool _loading = false;
  bool _disposed = false;

  bool get isLoading => _loading;

  void attach(ScrollController controller) {
    if (_bound == controller) return;
    detach();
    _bound = controller;
    controller.addListener(_handleScroll);
  }

  void detach() {
    _bound?.removeListener(_handleScroll);
    _bound = null;
  }

  Future<void> _handleScroll() async {
    if (_disposed || _loading) return;
    if (canLoadMore != null && !canLoadMore!()) return;
    final controller = _bound;
    if (controller == null || !controller.hasClients) return;

    final position = controller.position;
    if (position.pixels < position.maxScrollExtent - threshold) return;

    await retry();
  }

  Future<void> retry() async {
    if (_disposed || _loading) return;
    if (canLoadMore != null && !canLoadMore!()) return;
    _loading = true;
    try {
      await onLoadMore();
    } finally {
      _loading = false;
    }
  }

  void dispose() {
    _disposed = true;
    detach();
  }
}
