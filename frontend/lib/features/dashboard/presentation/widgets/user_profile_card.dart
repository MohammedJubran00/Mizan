import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/theme/app_colors.dart';

/// Bottom profile strip shown in the dashboard sidebar.
class UserProfileCard extends StatelessWidget {
  const UserProfileCard({
    super.key,
    this.name = AppStrings.placeholderUserName,
    this.role = AppStrings.placeholderUserRole,
    this.initials = AppStrings.placeholderUserInitials,
    this.onTap,
  });

  final String name;
  final String role;
  final String initials;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final avatarSize = AppDimensions.sidebarLogoSize(size) * 1.05;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        splashColor: AppColors.gold.withValues(alpha: 0.1),
        child: Padding(
          padding: EdgeInsets.symmetric(
            vertical: avatarSize * 0.2,
            horizontal: avatarSize * 0.1,
          ),
          child: Row(
            children: [
              Container(
                width: avatarSize,
                height: avatarSize,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.gold,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.gold.withValues(alpha: 0.25),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  initials,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: avatarSize * 0.34,
                    fontWeight: FontWeight.w700,
                    color: AppColors.navyDeep,
                  ),
                ),
              ),
              SizedBox(width: avatarSize * 0.28),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: avatarSize * 0.34,
                        fontWeight: FontWeight.w600,
                        color: AppColors.sidebarText,
                        letterSpacing: -0.2,
                      ),
                    ),
                    SizedBox(height: avatarSize * 0.06),
                    Text(
                      role,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: avatarSize * 0.28,
                        fontWeight: FontWeight.w500,
                        color: AppColors.sidebarMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
