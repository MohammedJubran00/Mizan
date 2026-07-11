import 'package:flutter/material.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_logo.dart';
import '../../data/dashboard_nav_data.dart';
import '../../domain/entities/nav_destination.dart';
import 'sidebar_section.dart';
import 'user_profile_card.dart';

/// Dark navigation rail used as a persistent sidebar or mobile drawer.
class Sidebar extends StatelessWidget {
  const Sidebar({
    super.key,
    required this.selectedPath,
    required this.onDestinationSelected,
  });

  final String selectedPath;
  final ValueChanged<NavDestination> onDestinationSelected;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final width = AppDimensions.sidebarWidth(size);
    final padding = AppDimensions.sidebarPadding(size);
    final logoSize = AppDimensions.sidebarLogoSize(size);
    final sectionGap = AppDimensions.sidebarItemHeight(size) * 0.55;

    return Container(
      width: width,
      decoration: const BoxDecoration(
        color: AppColors.sidebarBackground,
        border: Border(
          right: BorderSide(color: AppColors.sidebarBorder, width: 1),
        ),
      ),
      child: SafeArea(
        right: false,
        child: Padding(
          padding: padding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: EdgeInsets.only(
                  left: padding.left * 0.15,
                  bottom: sectionGap * 1.1,
                  top: sectionGap * 0.2,
                ),
                child: AppLogo(
                  markSize: logoSize,
                  tone: AppLogoTone.onDark,
                ),
              ),
              Expanded(
                child: ListView.separated(
                  padding: EdgeInsets.zero,
                  itemCount: DashboardNavData.sections.length,
                  separatorBuilder: (_, _) => SizedBox(height: sectionGap),
                  itemBuilder: (context, index) {
                    final section = DashboardNavData.sections[index];
                    return SidebarSection(
                      title: section.title,
                      items: section.items,
                      selectedPath: selectedPath,
                      onItemSelected: onDestinationSelected,
                    );
                  },
                ),
              ),
              Divider(
                height: sectionGap * 1.4,
                thickness: 1,
                color: AppColors.sidebarBorder,
              ),
              const UserProfileCard(),
            ],
          ),
        ),
      ),
    );
  }
}
