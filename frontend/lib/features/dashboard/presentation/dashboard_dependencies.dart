import '../../../core/cache/smart_cache.dart';
import '../../../core/network/api_client.dart';
import '../../../core/session/session_cubit.dart';
import '../../../core/storage/session_storage.dart';
import '../../../core/storage/token_storage.dart';
import '../../../core/theme/theme_cubit.dart';
import '../../auth/data/datasources/auth_remote_datasource.dart';
import '../../auth/data/repositories/auth_repository_impl.dart';
import '../../auth/domain/repositories/auth_repository.dart';
import '../../auth/domain/usecases/login_usecase.dart';
import '../../auth/domain/usecases/register_usecase.dart';
import '../data/datasources/dashboard_remote_datasource.dart';
import '../data/repositories/dashboard_repository_impl.dart';
import '../domain/repositories/dashboard_repository.dart';
import '../domain/usecases/get_dashboard_usecase.dart';
import 'cubit/activity_cubit.dart';
import 'cubit/chart_cubit.dart';
import 'cubit/dashboard_cubit.dart';
import 'cubit/deadline_cubit.dart';
import 'cubit/hearing_cubit.dart';
import 'cubit/overview_cubit.dart';
import 'cubit/revenue_cubit.dart';
import 'cubit/sidebar_cubit.dart';

/// Shared composition root for auth + dashboard.
class AppDependencies {
  AppDependencies._({
    required this.apiClient,
    required this.tokenStorage,
    required this.sessionStorage,
    required this.loginUseCase,
    required this.registerUseCase,
    required this.getDashboardUseCase,
    required this.sessionCubit,
    required this.themeCubit,
    required this.sidebarCubit,
  });

  final ApiClient apiClient;
  final TokenStorage tokenStorage;
  final SessionStorage sessionStorage;
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final GetDashboardUseCase getDashboardUseCase;
  final SessionCubit sessionCubit;
  final ThemeCubit themeCubit;
  final SidebarCubit sidebarCubit;

  static AppDependencies? _instance;

  static AppDependencies get instance => _instance ??= _create();

  static AppDependencies _create() {
    final tokenStorage = TokenStorage();
    final sessionStorage = SessionStorage();
    final apiClient = ApiClient(
      tokenStorage: tokenStorage,
      sessionStorage: sessionStorage,
    );

    final AuthRepository authRepository = AuthRepositoryImpl(
      remoteDataSource: AuthRemoteDataSourceImpl(apiClient),
      tokenStorage: tokenStorage,
    );

    final DashboardRepository dashboardRepository = DashboardRepositoryImpl(
      remoteDataSource: DashboardRemoteDataSourceImpl(apiClient),
    );

    return AppDependencies._(
      apiClient: apiClient,
      tokenStorage: tokenStorage,
      sessionStorage: sessionStorage,
      loginUseCase: LoginUseCase(authRepository),
      registerUseCase: RegisterUseCase(authRepository),
      getDashboardUseCase: GetDashboardUseCase(dashboardRepository),
      sessionCubit: SessionCubit(
        sessionStorage: sessionStorage,
        tokenStorage: tokenStorage,
      ),
      themeCubit: ThemeCubit(),
      sidebarCubit: SidebarCubit(),
    );
  }

  DashboardCubit createDashboardCubit() => DashboardCubit(
        getDashboard: getDashboardUseCase,
        overviewCubit: OverviewCubit(),
        revenueCubit: RevenueCubit(),
        chartCubit: ChartCubit(),
        activityCubit: ActivityCubit(),
        hearingCubit: HearingCubit(),
        deadlineCubit: DeadlineCubit(),
      );

  /// Soft-refresh hook for mutations (cases, invoices, hearings, etc.).
  /// Wired when a dashboard cubit is active; safe no-op otherwise.
  DashboardCubit? activeDashboardCubit;

  Future<void> refreshDashboardAfterMutation({
    String? workspaceId,
    Set<CacheDomain>? domains,
  }) async {
    final cubit = activeDashboardCubit;
    if (cubit == null || cubit.isClosed) return;
    await cubit.invalidateAfterMutation(
      workspaceId: workspaceId,
      domains: domains,
    );
  }

  static void reset() {
    _instance?.sessionCubit.close();
    _instance?.themeCubit.close();
    _instance?.sidebarCubit.close();
    _instance = null;
  }
}
