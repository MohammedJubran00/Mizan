import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/dashboard_nav_data.dart';
import '../../domain/entities/nav_destination.dart';
import 'dashboard_app_bar.dart';
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

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final size = Size(constraints.maxWidth, constraints.maxHeight);
        final persistent = AppDimensions.usePersistentSidebar(size);
        final destination =
            DashboardNavData.byPath(currentPath) ??
            DashboardNavData.defaultDestination;

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
        );

        return Scaffold(
          backgroundColor: AppColors.contentBackground,
          drawer: persistent
              ? null
              : Drawer(
                  backgroundColor: AppColors.sidebarBackground,
                  width: AppDimensions.sidebarWidth(size),
                  child: sidebar,
                ),
          body: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (persistent) sidebar,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Builder(
                      builder: (scaffoldContext) {
                        return DashboardAppBar(
                          title: destination.label,
                          showMenuButton: !persistent,
                          onMenuPressed: () =>
                              Scaffold.of(scaffoldContext).openDrawer(),
                        );
                      },
                    ),
                    Expanded(child: child),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
