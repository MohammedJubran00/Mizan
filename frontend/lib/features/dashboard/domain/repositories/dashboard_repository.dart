import '../../../../core/cache/smart_cache.dart';
import '../../domain/entities/dashboard_entity.dart';

abstract class DashboardRepository {
  Future<DashboardEntity> getDashboard({
    int? activityPage,
    int? activityPageSize,
    String? activityCursor,
    Object? cancelToken,
    bool forceRefresh = false,
  });

  void invalidateCache({
    String? workspaceId,
    Set<CacheDomain>? domains,
  });
}
