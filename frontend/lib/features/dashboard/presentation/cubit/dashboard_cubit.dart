import 'dart:async';

import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/cache/smart_cache.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../domain/entities/dashboard_entity.dart';
import '../../domain/usecases/get_dashboard_usecase.dart';
import 'activity_cubit.dart';
import 'chart_cubit.dart';
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
    this.offline = false,
  });

  final DashboardStatus status;
  final DashboardEntity? data;
  final String? errorMessage;
  final bool refreshing;
  final bool offline;

  bool get isLoading => status == DashboardStatus.loading && data == null;
  bool get isRefreshing => refreshing;

  DashboardState copyWith({
    DashboardStatus? status,
    DashboardEntity? data,
    String? errorMessage,
    bool? refreshing,
    bool? offline,
    bool clearError = false,
  }) {
    return DashboardState(
      status: status ?? this.status,
      data: data ?? this.data,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      refreshing: refreshing ?? this.refreshing,
      offline: offline ?? this.offline,
    );
  }

  @override
  List<Object?> get props =>
      [status, data, errorMessage, refreshing, offline];
}

/// Orchestrates fetches with cancel, race guards, silent refresh, and cache.
class DashboardCubit extends Cubit<DashboardState> {
  DashboardCubit({
    required this.getDashboard,
    required this.overviewCubit,
    required this.revenueCubit,
    required this.chartCubit,
    required this.activityCubit,
    required this.hearingCubit,
    required this.deadlineCubit,
  }) : super(const DashboardState());

  final GetDashboardUseCase getDashboard;
  final OverviewCubit overviewCubit;
  final RevenueCubit revenueCubit;
  final ChartCubit chartCubit;
  final ActivityCubit activityCubit;
  final HearingCubit hearingCubit;
  final DeadlineCubit deadlineCubit;

  int _requestGeneration = 0;
  CancelToken? _activeCancelToken;
  CancelToken? _loadMoreCancelToken;
  Timer? _backgroundTimer;
  bool _backgroundInFlight = false;

  void startBackgroundRefresh() {
    _backgroundTimer?.cancel();
    _backgroundTimer = Timer.periodic(
      DesignTokens.durationRefreshPoll,
      (_) {
        if (isClosed || _backgroundInFlight) return;
        if (state.status == DashboardStatus.success) {
          load(refresh: true, silent: true);
        }
      },
    );
  }

  void stopBackgroundRefresh() {
    _backgroundTimer?.cancel();
    _backgroundTimer = null;
  }

  /// Soft refresh after mutations — invalidates local cache first.
  Future<void> invalidateAfterMutation({
    String? workspaceId,
    Set<CacheDomain>? domains,
  }) async {
    getDashboard.invalidateCache(
      workspaceId: workspaceId ?? state.data?.workspace.id,
      domains: domains,
    );
    await load(refresh: true, silent: true, forceRefresh: true);
  }

  Future<void> load({
    bool refresh = false,
    bool silent = false,
    bool forceRefresh = false,
  }) async {
    if (state.status == DashboardStatus.loading && !refresh) return;
    if (silent && _backgroundInFlight) return;

    // Cancel obsolete in-flight request (newest wins).
    _activeCancelToken?.cancel('Superseded by newer dashboard request.');
    final cancelToken = CancelToken();
    _activeCancelToken = cancelToken;
    final generation = ++_requestGeneration;

    if (silent) _backgroundInFlight = true;

    if (refresh && state.data != null) {
      if (!silent) {
        emit(state.copyWith(refreshing: true, clearError: true, offline: false));
      }
    } else {
      emit(state.copyWith(
        status: DashboardStatus.loading,
        clearError: true,
        refreshing: false,
        offline: false,
      ));
      overviewCubit.setLoading();
      revenueCubit.setLoading();
      chartCubit.setLoading();
      activityCubit.setLoading();
      hearingCubit.setLoading();
      deadlineCubit.setLoading();
    }

    try {
      final data = await getDashboard(
        activityPage: 1,
        activityPageSize: 20,
        cancelToken: cancelToken,
        forceRefresh: forceRefresh,
      );

      if (generation != _requestGeneration || isClosed) return;
      if (cancelToken.isCancelled) return;

      // Preserve activity pagination if we already loaded more pages and this
      // is a silent background refresh of page 1.
      var distributed = data;
      if (silent &&
          state.data != null &&
          state.data!.activitiesPagination.page > 1) {
        distributed = data.copyWith(
          activityGroups: state.data!.activityGroups,
          activitiesPagination: state.data!.activitiesPagination,
        );
        overviewCubit.setSuccess(data.overview);
        revenueCubit.setSuccess(
          card: data.overview.revenue,
          analytics: data.charts.revenue,
        );
        chartCubit.setSuccess(data.charts);
        hearingCubit.setSuccess(data.hearings);
        deadlineCubit.setSuccess(data.deadlines);
        // Keep activity cubit as-is to preserve infinite-scroll state.
      } else {
        _distribute(distributed);
      }

      emit(
        DashboardState(
          status: DashboardStatus.success,
          data: distributed,
        ),
      );
    } on ApiException catch (e) {
      if (generation != _requestGeneration || isClosed) return;
      if (e.message == 'Request cancelled.') return;
      if (silent && state.data != null) {
        emit(state.copyWith(refreshing: false, offline: e.offline));
        return;
      }
      _distributeError(e.message);
      emit(
        state.copyWith(
          status: DashboardStatus.failure,
          errorMessage: e.message,
          refreshing: false,
          offline: e.offline,
        ),
      );
    } catch (_) {
      if (generation != _requestGeneration || isClosed) return;
      if (silent && state.data != null) {
        emit(state.copyWith(refreshing: false));
        return;
      }
      const message = 'Unable to load dashboard. Please try again.';
      _distributeError(message);
      emit(
        state.copyWith(
          status: DashboardStatus.failure,
          errorMessage: message,
          refreshing: false,
        ),
      );
    } finally {
      if (silent) _backgroundInFlight = false;
    }
  }

  Future<void> loadMoreActivities() async {
    final current = state.data;
    if (current == null || !current.activitiesPagination.hasMore) return;
    if (activityCubit.state.isLoadingMore) return;

    activityCubit.setLoadingMore();
    _loadMoreCancelToken?.cancel('New load-more request.');
    final cancelToken = CancelToken();
    _loadMoreCancelToken = cancelToken;
    final nextPage = current.activitiesPagination.page + 1;
    final cursor = current.activitiesPagination.nextCursor;

    try {
      final data = await getDashboard(
        activityPage: nextPage,
        activityPageSize: current.activitiesPagination.pageSize,
        activityCursor: cursor,
        cancelToken: cancelToken,
        forceRefresh: true,
      );
      if (isClosed || cancelToken.isCancelled) return;

      final mergedGroups = activityCubit.mergeGroups(
        current.activityGroups,
        data.activityGroups,
      );

      final merged = current.copyWith(
        activityGroups: mergedGroups,
        activitiesPagination: data.activitiesPagination,
        generatedAt: data.generatedAt,
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
    revenueCubit.setSuccess(
      card: data.overview.revenue,
      analytics: data.charts.revenue,
    );
    chartCubit.setSuccess(data.charts);
    activityCubit.setSuccess(data.activityGroups, data.activitiesPagination);
    hearingCubit.setSuccess(data.hearings);
    deadlineCubit.setSuccess(data.deadlines);
  }

  void _distributeError(String message) {
    if (state.data == null) {
      overviewCubit.setError(message);
      revenueCubit.setError(message);
      chartCubit.setError(message);
      activityCubit.setError(message);
      hearingCubit.setError(message);
      deadlineCubit.setError(message);
    }
  }

  @override
  Future<void> close() {
    stopBackgroundRefresh();
    _activeCancelToken?.cancel('Dashboard cubit closed.');
    _loadMoreCancelToken?.cancel('Dashboard cubit closed.');
    overviewCubit.close();
    revenueCubit.close();
    chartCubit.close();
    activityCubit.close();
    hearingCubit.close();
    deadlineCubit.close();
    return super.close();
  }
}
