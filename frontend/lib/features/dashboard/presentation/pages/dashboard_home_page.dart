import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/session/session_cubit.dart';
import '../cubit/activity_cubit.dart';
import '../cubit/dashboard_cubit.dart';
import '../cubit/deadline_cubit.dart';
import '../cubit/hearing_cubit.dart';
import '../cubit/overview_cubit.dart';
import '../cubit/revenue_cubit.dart';
import '../dashboard_dependencies.dart';
import '../widgets/dashboard_header.dart';
import '../widgets/dashboard_layout.dart';
import '../widgets/deadlines_panel.dart';
import '../widgets/recent_activity_panel.dart';
import '../widgets/section_error.dart';
import '../widgets/skeleton.dart';
import '../widgets/stat_overview_card.dart';
import '../widgets/upcoming_hearings_panel.dart';

/// Professional home overview — all values from backend DTOs.
class DashboardHomePage extends StatefulWidget {
  const DashboardHomePage({super.key});

  @override
  State<DashboardHomePage> createState() => _DashboardHomePageState();
}

class _DashboardHomePageState extends State<DashboardHomePage> {
  late final DashboardCubit _dashboardCubit;
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _dashboardCubit = AppDependencies.instance.createDashboardCubit();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _dashboardCubit.load();
    });
  }

  @override
  void dispose() {
    _scrollController
      ..removeListener(_onScroll)
      ..dispose();
    _dashboardCubit.close();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position;
    if (position.pixels >= position.maxScrollExtent - 240) {
      _dashboardCubit.loadMoreActivities();
    }
  }

  @override
  Widget build(BuildContext context) {
    final shell = DashboardShellScope.maybeOf(context);
    final showMenuButton = shell?.showMenuButton ?? false;
    final session = context.watch<SessionCubit>().state;

    return MultiBlocProvider(
      providers: [
        BlocProvider<DashboardCubit>.value(value: _dashboardCubit),
        BlocProvider<OverviewCubit>.value(value: _dashboardCubit.overviewCubit),
        BlocProvider<RevenueCubit>.value(value: _dashboardCubit.revenueCubit),
        BlocProvider<ActivityCubit>.value(value: _dashboardCubit.activityCubit),
        BlocProvider<HearingCubit>.value(value: _dashboardCubit.hearingCubit),
        BlocProvider<DeadlineCubit>.value(value: _dashboardCubit.deadlineCubit),
      ],
      child: BlocBuilder<DashboardCubit, DashboardState>(
        buildWhen: (prev, next) =>
            prev.status != next.status ||
            prev.errorMessage != next.errorMessage ||
            prev.refreshing != next.refreshing ||
            prev.data?.greeting != next.data?.greeting ||
            prev.data?.formattedDate != next.data?.formattedDate ||
            prev.data?.notifications != next.data?.notifications,
        builder: (context, state) {
          final data = state.data;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Builder(
                builder: (scaffoldContext) {
                  return DashboardHeader(
                    showMenuButton: showMenuButton,
                    onMenuPressed: () =>
                        Scaffold.of(scaffoldContext).openDrawer(),
                    greeting: data?.greeting,
                    formattedDate: data?.formattedDate,
                    workspaceName:
                        session.workspace?.name ?? data?.workspace.name,
                    unreadCount:
                        data?.notifications.unreadNotifications ?? 0,
                    onQuickAction: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Quick actions coming soon.'),
                        ),
                      );
                    },
                  );
                },
              ),
              Expanded(child: _DashboardBody(scrollController: _scrollController)),
            ],
          );
        },
      ),
    );
  }
}

class _DashboardBody extends StatelessWidget {
  const _DashboardBody({required this.scrollController});

  final ScrollController scrollController;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DashboardCubit, DashboardState>(
      buildWhen: (prev, next) =>
          prev.status != next.status ||
          prev.errorMessage != next.errorMessage ||
          prev.refreshing != next.refreshing,
      builder: (context, state) {
        if (state.status == DashboardStatus.failure && state.data == null) {
          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: SectionError(
                  message: state.errorMessage ??
                      'Unable to load dashboard. Please try again.',
                  onRetry: () => context.read<DashboardCubit>().load(),
                ),
              ),
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => context.read<DashboardCubit>().load(refresh: true),
          child: LayoutBuilder(
            builder: (context, constraints) {
              final width = constraints.maxWidth;
              final padding = EdgeInsets.symmetric(
                horizontal: width < 600
                    ? 16
                    : width < 1100
                        ? 24
                        : 32,
                vertical: 20,
              );
              final crossAxisCount = width >= 1400
                  ? 5
                  : width >= 1100
                      ? 4
                      : width >= 720
                          ? 3
                          : width >= 520
                              ? 2
                              : 1;
              final useTwoColumn = width >= 1100;

              return CustomScrollView(
                controller: scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverPadding(
                    padding: padding,
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        _OverviewGrid(crossAxisCount: crossAxisCount),
                        const SizedBox(height: 24),
                        if (useTwoColumn)
                          const _DesktopLower()
                        else
                          const _MobileLower(),
                        const SizedBox(height: 32),
                      ]),
                    ),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }
}

class _OverviewGrid extends StatelessWidget {
  const _OverviewGrid({required this.crossAxisCount});

  final int crossAxisCount;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OverviewCubit, OverviewState>(
      builder: (context, state) {
        if (state.status == SectionStatus.loading ||
            state.status == SectionStatus.initial) {
          return _CardsWrap(
            crossAxisCount: crossAxisCount,
            children: List.generate(8, (_) => const StatCardSkeleton()),
          );
        }

        if (state.status == SectionStatus.failure || state.overview == null) {
          return SectionError(
            message: state.errorMessage ?? 'Failed to load overview.',
            onRetry: () => context.read<DashboardCubit>().load(),
          );
        }

        final cards = state.overview!.cards;
        return _CardsWrap(
          crossAxisCount: crossAxisCount,
          children: [
            for (var i = 0; i < cards.length; i++)
              RepaintBoundary(
                child: StatOverviewCard(
                  card: cards[i],
                  icon: iconForStatTitle(cards[i].title),
                  delay: Duration(milliseconds: 40 * i),
                ),
              ),
          ],
        );
      },
    );
  }
}

class _CardsWrap extends StatelessWidget {
  const _CardsWrap({
    required this.crossAxisCount,
    required this.children,
  });

  final int crossAxisCount;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final gap = 16.0;
        final itemWidth =
            (constraints.maxWidth - gap * (crossAxisCount - 1)) / crossAxisCount;
        return Wrap(
          spacing: gap,
          runSpacing: gap,
          children: [
            for (final child in children)
              SizedBox(width: itemWidth, child: child),
          ],
        );
      },
    );
  }
}

class _DesktopLower extends StatelessWidget {
  const _DesktopLower();

  @override
  Widget build(BuildContext context) {
    return const Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 5,
          child: Column(
            children: [
              _HearingsSection(),
              SizedBox(height: 16),
              _DeadlinesSection(),
            ],
          ),
        ),
        SizedBox(width: 16),
        Expanded(flex: 4, child: _ActivitySection()),
      ],
    );
  }
}

class _MobileLower extends StatelessWidget {
  const _MobileLower();

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        _HearingsSection(),
        SizedBox(height: 16),
        _DeadlinesSection(),
        SizedBox(height: 16),
        _ActivitySection(),
      ],
    );
  }
}

class _HearingsSection extends StatelessWidget {
  const _HearingsSection();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HearingCubit, HearingState>(
      builder: (context, state) {
        return UpcomingHearingsPanel(
          items: state.items,
          isLoading: state.status == SectionStatus.loading ||
              state.status == SectionStatus.initial,
          errorMessage:
              state.status == SectionStatus.failure ? state.errorMessage : null,
          onRetry: () => context.read<DashboardCubit>().load(),
        );
      },
    );
  }
}

class _DeadlinesSection extends StatelessWidget {
  const _DeadlinesSection();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DeadlineCubit, DeadlineState>(
      builder: (context, state) {
        return DeadlinesPanel(
          items: state.items,
          isLoading: state.status == SectionStatus.loading ||
              state.status == SectionStatus.initial,
          errorMessage:
              state.status == SectionStatus.failure ? state.errorMessage : null,
          onRetry: () => context.read<DashboardCubit>().load(),
        );
      },
    );
  }
}

class _ActivitySection extends StatelessWidget {
  const _ActivitySection();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ActivityCubit, ActivityState>(
      builder: (context, state) {
        return RecentActivityPanel(
          groups: state.groups,
          isLoading: state.status == SectionStatus.loading ||
              state.status == SectionStatus.initial,
          hasMore: state.hasMore,
          isLoadingMore: state.isLoadingMore,
          errorMessage:
              state.status == SectionStatus.failure ? state.errorMessage : null,
          onRetry: () => context.read<DashboardCubit>().load(),
          onLoadMore: () => context.read<DashboardCubit>().loadMoreActivities(),
        );
      },
    );
  }
}
