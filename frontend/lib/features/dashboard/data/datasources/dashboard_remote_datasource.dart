import 'package:dio/dio.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../models/dashboard_model.dart';

abstract class DashboardRemoteDataSource {
  Future<DashboardModel> fetchDashboard({
    int? activityPage,
    int? activityPageSize,
    String? activityCursor,
    CancelToken? cancelToken,
  });
}

class DashboardRemoteDataSourceImpl implements DashboardRemoteDataSource {
  DashboardRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<DashboardModel> fetchDashboard({
    int? activityPage,
    int? activityPageSize,
    String? activityCursor,
    CancelToken? cancelToken,
  }) async {
    final query = <String, dynamic>{};
    if (activityPage != null) query['activityPage'] = activityPage;
    if (activityPageSize != null) query['activityPageSize'] = activityPageSize;
    if (activityCursor != null) query['activityCursor'] = activityCursor;

    final response = await _client.get<Map<String, dynamic>>(
      ApiEndpoints.dashboard,
      queryParameters: query.isEmpty ? null : query,
      cancelToken: cancelToken,
    );

    final data = response.data ?? const <String, dynamic>{};
    return DashboardModel.fromJson(data);
  }
}
