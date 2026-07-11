/// Cache domain tags — mirror backend for selective invalidation.
enum CacheDomain {
  dashboard,
  overview,
  revenue,
  charts,
  hearings,
  deadlines,
  activities,
  alerts,
  notifications,
  team,
  cases,
  clients,
  billing,
  invoices,
  users,
  documents,
}

class SmartCacheEntry<T> {
  SmartCacheEntry({
    required this.value,
    required this.workspaceId,
    required this.tags,
    required this.expiresAt,
    required this.version,
    required this.createdAt,
  });

  final T value;
  final String workspaceId;
  final Set<CacheDomain> tags;
  final DateTime expiresAt;
  final int version;
  final DateTime createdAt;

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}

/// In-memory Smart Cache — workspace-isolated, TTL, versioning, request dedupe.
class SmartCache {
  SmartCache({this.maxEntries = 256});

  final int maxEntries;
  final Map<String, SmartCacheEntry<dynamic>> _store = {};
  final Map<String, Future<dynamic>> _inflight = {};
  final Map<String, int> _versions = {};

  int versionOf(String workspaceId) => _versions[workspaceId] ?? 0;

  T? get<T>(String key) {
    final entry = _store[key];
    if (entry == null) return null;
    if (entry.isExpired) {
      _store.remove(key);
      return null;
    }
    return entry.value as T;
  }

  void set<T>(
    String key,
    T value, {
    required String workspaceId,
    required Duration ttl,
    required Set<CacheDomain> tags,
  }) {
    final version = versionOf(workspaceId);
    _evictIfNeeded();
    _store[key] = SmartCacheEntry<T>(
      value: value,
      workspaceId: workspaceId,
      tags: tags,
      expiresAt: DateTime.now().add(ttl),
      version: version,
      createdAt: DateTime.now(),
    );
  }

  void invalidateWorkspace(String workspaceId) {
    _bump(workspaceId);
    _store.removeWhere((_, e) => e.workspaceId == workspaceId);
  }

  int invalidateTags(String workspaceId, Set<CacheDomain> tags) {
    if (tags.isEmpty) return 0;
    _bump(workspaceId);
    final keys = <String>[];
    _store.forEach((key, entry) {
      if (entry.workspaceId == workspaceId &&
          entry.tags.any(tags.contains)) {
        keys.add(key);
      }
    });
    for (final key in keys) {
      _store.remove(key);
    }
    return keys.length;
  }

  /// One network load shared by concurrent callers for the same key.
  Future<T> getOrLoad<T>(
    String key, {
    required String workspaceId,
    required Duration ttl,
    required Set<CacheDomain> tags,
    required Future<T> Function() loader,
    bool forceRefresh = false,
  }) async {
    if (!forceRefresh) {
      final cached = get<T>(key);
      if (cached != null) return cached;
    }

    final existing = _inflight[key] as Future<T>?;
    if (existing != null) return existing;

    final future = () async {
      try {
        final value = await loader();
        set(
          key,
          value,
          workspaceId: workspaceId,
          ttl: ttl,
          tags: tags,
        );
        return value;
      } finally {
        _inflight.remove(key);
      }
    }();

    _inflight[key] = future;
    return future;
  }

  int get size => _store.length;

  void clear() {
    _store.clear();
    _inflight.clear();
    _versions.clear();
  }

  void _bump(String workspaceId) {
    _versions[workspaceId] = versionOf(workspaceId) + 1;
  }

  void _evictIfNeeded() {
    if (_store.length < maxEntries) return;
    _store.removeWhere((_, e) => e.isExpired);
    if (_store.length < maxEntries) return;

    final ordered = _store.entries.toList()
      ..sort((a, b) => a.value.createdAt.compareTo(b.value.createdAt));
    final drop = (maxEntries * 0.1).ceil().clamp(1, ordered.length);
    for (var i = 0; i < drop; i++) {
      _store.remove(ordered[i].key);
    }
  }
}
