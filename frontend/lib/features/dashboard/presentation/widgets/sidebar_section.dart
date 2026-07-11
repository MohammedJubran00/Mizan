import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/app_colors.dart';
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
  });

  final String title;
  final List<NavDestination> items;
  final String selectedPath;
  final ValueChanged<NavDestination> onItemSelected;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final gap = AppDimensions.sidebarItemHeight(size) * 0.35;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: EdgeInsets.only(
            left: gap * 0.35,
            bottom: gap * 0.55,
            top: gap * 0.4,
          ),
          child: Text(
            title.toUpperCase(),
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.sidebarMuted.withValues(alpha: 0.75),
              letterSpacing: 1.4,
            ),
          ),
        ),
        ...items.map(
          (item) => SidebarItem(
            label: item.label,
            icon: item.icon,
            selected: item.path == selectedPath,
            badgeLabel: item.badgeLabel,
            badgeCount: item.badgeCount,
            onTap: () => onItemSelected(item),
          ),
        ),
      ],
    );
  }
}
