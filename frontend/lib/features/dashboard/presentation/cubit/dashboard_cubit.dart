import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/network/api_exception.dart';
import '../../domain/entities/dashboard_entity.dart';
import '../../domain/usecases/get_dashboard_usecase.dart';
import 'activity_cubit.dart';
import 'deadline_cubit.dart';
import 'hearing_cubit.dart';
import 'overview_cubit.dart';
import 'revenue_cubit.dart';

enum DashboardStatus { initial, loading, success, failure }

class DashboardState extends Equatable {
  const DashboardState({
    this.status = DashboardStatus.initial,
    this.data,
    this.errorMessage,
    this.refreshing = false,
  });

  final DashboardStatus status;
  final DashboardEntity? data;
  final String? errorMessage;
  final bool refreshing;

  bool get isLoading => status == DashboardStatus.loading && data == null;
  bool get isRefreshing => refreshing;

  DashboardState copyWith({
    DashboardStatus? status,
    DashboardEntity? data,
    String? errorMessage,
    bool? refreshing,
    bool clearError = false,
  }) {
    return DashboardState(
      status: status ?? this.status,
      data: data ?? this.data,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      refreshing: refreshing ?? this.refreshing,
    );
  }

  @override
  List<Object?> get props => [status, data, errorMessage, refreshing];
}

/// Orchestrates a single fetch and fans out slices to section cubits.
class DashboardCubit extends Cubit<DashboardState> {
  DashboardCubit({
    required this.getDashboard,
    required this.overviewCubit,
    required this.revenueCubit,
    required this.activityCubit,
    required this.hearingCubit,
    required this.deadlineCubit,
  }) : super(const DashboardState());

  final GetDashboardUseCase getDashboard;
  final OverviewCubit overviewCubit;
  final RevenueCubit revenueCubit;
  final ActivityCubit activityCubit;
  final HearingCubit hearingCubit;
  final DeadlineCubit deadlineCubit;

  Object? _activeToken;

  Future<void> load({bool refresh = false}) async {
    if (state.status == DashboardStatus.loading && !refresh) return;

    _activeToken = Object();
    final token = _activeToken;

    if (refresh && state.data != null) {
      emit(state.copyWith(refreshing: true, clearError: true));
    } else {
      emit(state.copyWith(
        status: DashboardStatus.loading,
        clearError: true,
        refreshing: false,
      ));
      overviewCubit.setLoading();
      revenueCubit.setLoading();
      activityCubit.setLoading();
      hearingCubit.setLoading();
      deadlineCubit.setLoading();
    }

    try {
      final data = await getDashboard(
        activityPage: 1,
        activityPageSize: 20,
      );

      if (token != _activeToken || isClosed) return;

      _distribute(data);
      emit(
        DashboardState(
          status: DashboardStatus.success,
          data: data,
        ),
      );
    } on ApiException catch (e) {
      if (token != _activeToken || isClosed) return;
      if (e.message == 'Request cancelled.') return;
      _distributeError(e.message);
      emit(
        state.copyWith(
          status: DashboardStatus.failure,
          errorMessage: e.message,
          refreshing: false,
        ),
      );
    } catch (_) {
      if (token != _activeToken || isClosed) return;
      const message = 'Unable to load dashboard. Please try again.';
      _distributeError(message);
      emit(
        state.copyWith(
          status: DashboardStatus.failure,
          errorMessage: message,
          refreshing: false,
        ),
      );
    }
  }

  Future<void> loadMoreActivities() async {
    final current = state.data;
    if (current == null || !current.activitiesPagination.hasMore) return;
    if (activityCubit.state.isLoadingMore) return;

    activityCubit.setLoadingMore();
    final nextPage = current.activitiesPagination.page + 1;

    try {
      final data = await getDashboard(
        activityPage: nextPage,
        activityPageSize: current.activitiesPagination.pageSize,
      );
      if (isClosed) return;

      final mergedGroups = activityCubit.mergeGroups(
        current.activityGroups,
        data.activityGroups,
      );

      final merged = DashboardEntity(
        generatedAt: data.generatedAt,
        greeting: data.greeting,
        user: data.user,
        workspace: data.workspace,
        overview: data.overview,
        hearings: data.hearings,
        deadlines: data.deadlines,
        activityGroups: mergedGroups,
        activitiesPagination: data.activitiesPagination,
        notifications: data.notifications,
        formattedDate: data.formattedDate,
      );

      activityCubit.setSuccess(mergedGroups, merged.activitiesPagination);
      emit(state.copyWith(data: merged, status: DashboardStatus.success));
    } on ApiException catch (e) {
      if (e.message == 'Request cancelled.') return;
      activityCubit.setError(e.message);
    } catch (_) {
      activityCubit.setError('Unable to load more activity.');
    }
  }

  void _distribute(DashboardEntity data) {
    overviewCubit.setSuccess(data.overview);
    revenueCubit.setSuccess(data.overview.revenue);
    activityCubit.setSuccess(data.activityGroups, data.activitiesPagination);
    hearingCubit.setSuccess(data.hearings);
    deadlineCubit.setSuccess(data.deadlines);
  }

  void _distributeError(String message) {
    if (state.data == null) {
      overviewCubit.setError(message);
      revenueCubit.setError(message);
      activityCubit.setError(message);
      hearingCubit.setError(message);
      deadlineCubit.setError(message);
    }
  }

  @override
  Future<void> close() {
    overviewCubit.close();
    revenueCubit.close();
    activityCubit.close();
    hearingCubit.close();
    deadlineCubit.close();
    return super.close();
  }
}
