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
  }) {
    return _repository.getDashboard(
      activityPage: activityPage,
      activityPageSize: activityPageSize,
      activityCursor: activityCursor,
      cancelToken: cancelToken,
    );
  }
}
