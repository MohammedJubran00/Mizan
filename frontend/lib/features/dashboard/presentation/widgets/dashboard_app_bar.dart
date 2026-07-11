import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/theme/app_colors.dart';
import 'dashboard_search_bar.dart';
import 'notification_button.dart';

/// Top chrome for the dashboard shell — title, search, notifications, avatar.
class DashboardAppBar extends StatelessWidget implements PreferredSizeWidget {
  const DashboardAppBar({
    super.key,
    required this.title,
    this.showMenuButton = false,
    this.onMenuPressed,
    this.onNotificationPressed,
    this.onProfilePressed,
  });

  final String title;
  final bool showMenuButton;
  final VoidCallback? onMenuPressed;
  final VoidCallback? onNotificationPressed;
  final VoidCallback? onProfilePressed;

  @override
  Size get preferredSize {
    // PreferredSize is resolved before MediaQuery in some cases; use a
    // sensible default that LayoutBuilder in [build] still respects visually.
    return const Size.fromHeight(68);
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final height = AppDimensions.appBarHeight(size);
    final horizontal = AppDimensions.contentPadding(size).horizontal / 2;
    final compact = size.width < 600;
    final avatarSize = height * 0.48;

    return Material(
      color: AppColors.white,
      elevation: 0,
      child: Container(
        height: height,
        decoration: const BoxDecoration(
          border: Border(
            bottom: BorderSide(color: AppColors.appBarBorder, width: 1),
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.shadow,
              blurRadius: 12,
              offset: Offset(0, 2),
            ),
          ],
        ),
        padding: EdgeInsets.symmetric(horizontal: horizontal),
        child: Row(
          children: [
            if (showMenuButton) ...[
              IconButton(
                onPressed: onMenuPressed,
                tooltip: MaterialLocalizations.of(context).openAppDrawerTooltip,
                icon: const Icon(Icons.menu_rounded),
                color: AppColors.navy,
              ),
              SizedBox(width: horizontal * 0.25),
            ],
            Expanded(
              child: Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: compact ? 18 : 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.navyDeep,
                  letterSpacing: -0.3,
                ),
              ),
            ),
            if (!compact) ...[
              const DashboardSearchBar(),
              SizedBox(width: horizontal * 0.55),
            ] else ...[
              IconButton(
                onPressed: () {},
                tooltip: AppStrings.searchPlaceholder,
                icon: const Icon(Icons.search_rounded),
                color: AppColors.navyMuted,
              ),
            ],
            NotificationButton(onPressed: onNotificationPressed),
            SizedBox(width: horizontal * 0.45),
            Material(
              color: Colors.transparent,
              shape: const CircleBorder(),
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: onProfilePressed ?? () {},
                child: Container(
                  width: avatarSize,
                  height: avatarSize,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppColors.gold,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.goldLight.withValues(alpha: 0.5),
                      width: 2,
                    ),
                  ),
                  child: Text(
                    AppStrings.placeholderUserInitials,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: avatarSize * 0.34,
                      fontWeight: FontWeight.w700,
                      color: AppColors.navyDeep,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
