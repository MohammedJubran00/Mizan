import 'package:flutter/material.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/mizan_theme_extension.dart';
import '../../domain/entities/nav_destination.dart';
import 'sidebar_item.dart';

/// Labeled group of [SidebarItem]s (e.g. Workspace, Practice).
class SidebarSection extends StatelessWidget {
  const SidebarSection({
    super.key,
    required this.title,
    required this.items,
    required this.selectedPath,
    required this.onItemSelected,
    this.collapsed = false,
  });

  final String? title;
  final List<NavDestination> items;
  final String selectedPath;
  final ValueChanged<NavDestination> onItemSelected;
  final bool collapsed;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final gap = AppDimensions.sidebarItemHeight(size) * 0.35;
    final mizan = context.mizanTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (!collapsed && title != null)
          Padding(
            padding: EdgeInsets.only(
              left: gap * 0.35,
              bottom: gap * 0.55,
              top: gap * 0.4,
            ),
            child: Text(
              title!.toUpperCase(),
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    fontSize: 11,
                    color: mizan.sidebarMuted.withValues(alpha: 0.75),
                    letterSpacing: 1.4,
                  ),
            ),
          ),
        ...items.map(
          (item) => SidebarItem(
            label: item.label,
            icon: item.icon,
            selected: item.path == selectedPath,
            badgeLabel: collapsed ? null : item.badgeLabel,
            badgeCount: collapsed ? null : item.badgeCount,
            collapsed: collapsed,
            onTap: () => onItemSelected(item),
          ),
        ),
      ],
    );
  }
}
