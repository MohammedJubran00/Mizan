import 'package:flutter/material.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/mizan_theme_extension.dart';

/// Bottom profile strip shown in the dashboard sidebar.
class UserProfileCard extends StatelessWidget {
  const UserProfileCard({
    super.key,
    required this.name,
    required this.role,
    required this.initials,
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
    final mizan = context.mizanTheme;
    final theme = Theme.of(context);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        splashColor: mizan.accent.withValues(alpha: 0.1),
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
                  color: mizan.accent,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: mizan.accent.withValues(alpha: 0.25),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  initials,
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontSize: avatarSize * 0.34,
                    color: Colors.black,
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
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontSize: avatarSize * 0.34,
                        color: mizan.sidebarText,
                        letterSpacing: -0.2,
                      ),
                    ),
                    if (role.isNotEmpty) ...[
                      SizedBox(height: avatarSize * 0.06),
                      Text(
                        role,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontSize: avatarSize * 0.28,
                          color: mizan.sidebarMuted,
                        ),
                      ),
                    ],
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
