import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_strings.dart';
import '../../../../core/theme/app_colors.dart';

class FooterLinks extends StatelessWidget {
  const FooterLinks({
    super.key,
    this.onPrivacyTap,
    this.onTermsTap,
    this.onSecurityTap,
  });

  final VoidCallback? onPrivacyTap;
  final VoidCallback? onTermsTap;
  final VoidCallback? onSecurityTap;

  @override
  Widget build(BuildContext context) {
    final muted = GoogleFonts.plusJakartaSans(
      fontSize: 12,
      fontWeight: FontWeight.w400,
      color: AppColors.textMuted,
    );
    final link = muted.copyWith(
      color: AppColors.textSecondary,
      fontWeight: FontWeight.w500,
    );

    return Column(
      children: [
        Text(AppStrings.copyright, style: muted, textAlign: TextAlign.center),
        const SizedBox(height: 10),
        Wrap(
          alignment: WrapAlignment.center,
          spacing: 6,
          runSpacing: 4,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            _FooterLink(
              label: AppStrings.privacyPolicy,
              style: link,
              onTap: onPrivacyTap,
            ),
            Text('·', style: muted),
            _FooterLink(
              label: AppStrings.termsOfService,
              style: link,
              onTap: onTermsTap,
            ),
            Text('·', style: muted),
            _FooterLink(
              label: AppStrings.security,
              style: link,
              onTap: onSecurityTap,
            ),
          ],
        ),
      ],
    );
  }
}

class _FooterLink extends StatelessWidget {
  const _FooterLink({
    required this.label,
    required this.style,
    this.onTap,
  });

  final String label;
  final TextStyle style;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap ?? () {},
      borderRadius: BorderRadius.circular(4),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 2),
        child: Text(label, style: style),
      ),
    );
  }
}
