import '../../domain/entities/dashboard_entity.dart';

abstract class DashboardRepository {
  Future<DashboardEntity> getDashboard({
    int? activityPage,
    int? activityPageSize,
    String? activityCursor,
    Object? cancelToken,
  });
}
