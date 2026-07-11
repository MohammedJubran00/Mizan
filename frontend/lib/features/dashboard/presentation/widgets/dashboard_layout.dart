import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/session/session_cubit.dart';
import '../../../../core/theme/mizan_theme_extension.dart';
import '../../domain/entities/nav_destination.dart';
import 'dashboard_header.dart';
import 'sidebar.dart';

/// Responsive shell: persistent sidebar on large screens, drawer on compact.
class DashboardLayout extends StatelessWidget {
  const DashboardLayout({
    super.key,
    required this.child,
    required this.currentPath,
  });

  final Widget child;
  final String currentPath;

  bool get _isHome => currentPath == '/dashboard';

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final size = Size(constraints.maxWidth, constraints.maxHeight);
        final persistent = AppDimensions.usePersistentSidebar(size);
        final mizan = context.mizanTheme;

        void select(NavDestination item) {
          if (!persistent && Navigator.of(context).canPop()) {
            Navigator.of(context).pop();
          }
          if (item.path != currentPath) {
            context.go(item.path);
          }
        }

        final sidebar = Sidebar(
          selectedPath: currentPath,
          onDestinationSelected: select,
          forceExpanded: !persistent,
        );

        final body = _isHome
            ? DashboardShellScope(
                showMenuButton: !persistent,
                child: child,
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Builder(
                    builder: (scaffoldContext) {
                      return DashboardHeader(
                        showMenuButton: !persistent,
                        onMenuPressed: () =>
                            Scaffold.of(scaffoldContext).openDrawer(),
                        workspaceName: context
                            .watch<SessionCubit>()
                            .state
                            .workspace
                            ?.name,
                      );
                    },
                  ),
                  Expanded(child: child),
                ],
              );

        return Scaffold(
          backgroundColor: mizan.contentBackground,
          drawer: persistent
              ? null
              : Drawer(
                  backgroundColor: mizan.sidebarBackground,
                  width: AppDimensions.sidebarWidth(size),
                  child: sidebar,
                ),
          body: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (persistent) sidebar,
              Expanded(child: body),
            ],
          ),
        );
      },
    );
  }
}

/// Passes shell chrome flags to [DashboardHomePage] without coupling Cubits to the layout.
class DashboardShellScope extends InheritedWidget {
  const DashboardShellScope({
    super.key,
    required this.showMenuButton,
    required super.child,
  });

  final bool showMenuButton;

  static DashboardShellScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<DashboardShellScope>();
  }

  @override
  bool updateShouldNotify(DashboardShellScope oldWidget) {
    return showMenuButton != oldWidget.showMenuButton;
  }
}
