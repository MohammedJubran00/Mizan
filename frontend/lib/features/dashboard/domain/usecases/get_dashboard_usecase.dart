import '../../../../core/cache/smart_cache.dart';
import '../entities/dashboard_entity.dart';
import '../repositories/dashboard_repository.dart';

class GetDashboardUseCase {
  const GetDashboardUseCase(this._repository);

  final DashboardRepository _repository;

  Future<DashboardEntity> call({
    int? activityPage,
    int? activityPageSize,
    String? activityCursor,
    Object? cancelToken,
    bool forceRefresh = false,
  }) {
    return _repository.getDashboard(
      activityPage: activityPage,
      activityPageSize: activityPageSize,
      activityCursor: activityCursor,
      cancelToken: cancelToken,
      forceRefresh: forceRefresh,
    );
  }

  void invalidateCache({
    String? workspaceId,
    Set<CacheDomain>? domains,
  }) {
    _repository.invalidateCache(workspaceId: workspaceId, domains: domains);
  }
}
