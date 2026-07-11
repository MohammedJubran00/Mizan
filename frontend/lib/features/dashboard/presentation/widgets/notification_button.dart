import 'package:flutter/material.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/theme/app_colors.dart';

/// App-bar notification control with optional unread indicator.
class NotificationButton extends StatelessWidget {
  const NotificationButton({
    super.key,
    this.onPressed,
    this.hasUnread = true,
  });

  final VoidCallback? onPressed;
  final bool hasUnread;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final buttonSize = AppDimensions.appBarHeight(size) * 0.55;

    return Tooltip(
      message: AppStrings.notifications,
      child: Material(
        color: AppColors.inputFill,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed ?? () {},
          splashColor: AppColors.gold.withValues(alpha: 0.15),
          child: SizedBox(
            width: buttonSize,
            height: buttonSize,
            child: Stack(
              alignment: Alignment.center,
              children: [
                Icon(
                  Icons.notifications_none_rounded,
                  size: buttonSize * 0.5,
                  color: AppColors.navyMuted,
                ),
                if (hasUnread)
                  Positioned(
                    top: buttonSize * 0.22,
                    right: buttonSize * 0.24,
                    child: Container(
                      width: buttonSize * 0.16,
                      height: buttonSize * 0.16,
                      decoration: BoxDecoration(
                        color: AppColors.gold,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.white, width: 1.5),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
