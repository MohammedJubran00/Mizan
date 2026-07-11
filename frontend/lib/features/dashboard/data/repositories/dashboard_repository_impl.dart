import 'package:dio/dio.dart';

import '../../domain/entities/dashboard_entity.dart';
import '../../domain/repositories/dashboard_repository.dart';
import '../datasources/dashboard_remote_datasource.dart';

class DashboardRepositoryImpl implements DashboardRepository {
  DashboardRepositoryImpl({required DashboardRemoteDataSource remoteDataSource})
      : _remote = remoteDataSource;

  final DashboardRemoteDataSource _remote;

  @override
  Future<DashboardEntity> getDashboard({
    int? activityPage,
    int? activityPageSize,
    String? activityCursor,
    Object? cancelToken,
  }) async {
    final model = await _remote.fetchDashboard(
      activityPage: activityPage,
      activityPageSize: activityPageSize,
      activityCursor: activityCursor,
      cancelToken: cancelToken is CancelToken ? cancelToken : null,
    );
    return model.entity;
  }
}
