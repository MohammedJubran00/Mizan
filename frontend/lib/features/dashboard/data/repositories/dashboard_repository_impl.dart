import 'package:dio/dio.dart';

import '../../../../core/cache/smart_cache.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/session_storage.dart';
import '../../domain/entities/dashboard_entity.dart';
import '../../domain/repositories/dashboard_repository.dart';
import '../datasources/dashboard_remote_datasource.dart';

const _dashboardTtl = Duration(seconds: 40);
const _dashboardTags = {
  CacheDomain.dashboard,
  CacheDomain.overview,
  CacheDomain.revenue,
  CacheDomain.charts,
  CacheDomain.hearings,
  CacheDomain.deadlines,
  CacheDomain.activities,
  CacheDomain.team,
  CacheDomain.billing,
};

/// Repository-level Smart Cache + request deduplication + cancel support.
class DashboardRepositoryImpl implements DashboardRepository {
  DashboardRepositoryImpl({
    required DashboardRemoteDataSource remoteDataSource,
    SmartCache? cache,
    SessionStorage? sessionStorage,
  })  : _remote = remoteDataSource,
        _cache = cache ?? appSmartCache,
        _sessionStorage = sessionStorage ?? SessionStorage();

  final DashboardRemoteDataSource _remote;
  final SmartCache _cache;
  final SessionStorage _sessionStorage;

  @override
  Future<DashboardEntity> getDashboard({
    int? activityPage,
    int? activityPageSize,
    String? activityCursor,
    Object? cancelToken,
    bool forceRefresh = false,
  }) async {
    final workspace = await _sessionStorage.readWorkspace();
    final workspaceId = workspace?.id ?? 'anonymous';
    final page = activityPage ?? 1;
    final size = activityPageSize ?? 20;
    final cursor = activityCursor ?? '';
    final cacheKey =
        'v1:dashboard:$workspaceId:p$page:s$size:c$cursor';

    // Pagination beyond page 1 should not poison the primary dashboard cache.
    final useCache = page == 1 && cursor.isEmpty;

    Future<DashboardEntity> loader() async {
      final model = await _remote.fetchDashboard(
        activityPage: activityPage,
        activityPageSize: activityPageSize,
        activityCursor: activityCursor,
        cancelToken: cancelToken is CancelToken ? cancelToken : null,
      );
      return model.entity;
    }

    if (!useCache) {
      return loader();
    }

    return _cache.getOrLoad<DashboardEntity>(
      cacheKey,
      workspaceId: workspaceId,
      ttl: _dashboardTtl,
      tags: _dashboardTags,
      forceRefresh: forceRefresh,
      loader: loader,
    );
  }

  @override
  void invalidateCache({
    String? workspaceId,
    Set<CacheDomain>? domains,
  }) {
    if (workspaceId == null) {
      _cache.clear();
      return;
    }
    if (domains == null || domains.isEmpty) {
      _cache.invalidateWorkspace(workspaceId);
      return;
    }
    _cache.invalidateTags(workspaceId, domains);
  }
}
