import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/session/session_cubit.dart';
import '../../../../core/theme/mizan_theme_extension.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../../../core/widgets/app_logo.dart';
import '../../data/dashboard_nav_data.dart';
import '../../domain/entities/nav_destination.dart';
import '../cubit/sidebar_cubit.dart';
import 'sidebar_section.dart';
import 'user_profile_card.dart';

/// Reusable professional sidebar — collapsed / expanded with theme & logout.
class Sidebar extends StatelessWidget {
  const Sidebar({
    super.key,
    required this.selectedPath,
    required this.onDestinationSelected,
    this.forceExpanded = false,
  });

  final String selectedPath;
  final ValueChanged<NavDestination> onDestinationSelected;
  final bool forceExpanded;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final mizan = context.mizanTheme;
    final session = context.watch<SessionCubit>().state;
    final collapsed =
        !forceExpanded && context.watch<SidebarCubit>().state.collapsed;
    final width = collapsed
        ? AppDimensions.sidebarCollapsedWidth
        : AppDimensions.sidebarWidth(size);
    final padding = AppDimensions.sidebarPadding(size);
    final logoSize = AppDimensions.sidebarLogoSize(size);
    final sectionGap = AppDimensions.sidebarItemHeight(size) * 0.55;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      width: width,
      decoration: BoxDecoration(
        color: mizan.sidebarBackground,
        border: Border(
          right: BorderSide(color: mizan.sidebarBorder, width: 1),
        ),
      ),
      child: SafeArea(
        right: false,
        child: Padding(
          padding: collapsed
              ? EdgeInsets.symmetric(vertical: padding.vertical, horizontal: 8)
              : padding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  if (!collapsed)
                    Expanded(
                      child: AppLogo(
                        markSize: logoSize,
                        tone: AppLogoTone.onDark,
                      ),
                    )
                  else
                    Expanded(
                      child: Center(
                        child: AppLogo(
                          markSize: logoSize * 0.85,
                          tone: AppLogoTone.onDark,
                          showWordmark: false,
                        ),
                      ),
                    ),
                  if (!forceExpanded)
                    IconButton(
                      tooltip: collapsed ? 'Expand sidebar' : 'Collapse sidebar',
                      onPressed: () => context.read<SidebarCubit>().toggle(),
                      icon: Icon(
                        collapsed
                            ? Icons.chevron_right_rounded
                            : Icons.chevron_left_rounded,
                        color: mizan.sidebarMuted,
                      ),
                    ),
                ],
              ),
              if (!collapsed) ...[
                const SizedBox(height: 8),
                _WorkspaceBanner(
                  name: session.workspace?.name ?? 'Workspace',
                  role: session.workspace?.role ?? '',
                ),
                SizedBox(height: sectionGap),
              ] else
                SizedBox(height: sectionGap * 0.6),
              Expanded(
                child: ListView.separated(
                  padding: EdgeInsets.zero,
                  itemCount: DashboardNavData.sections.length,
                  separatorBuilder: (_, _) => SizedBox(height: sectionGap),
                  itemBuilder: (context, index) {
                    final section = DashboardNavData.sections[index];
                    return SidebarSection(
                      title: collapsed ? null : section.title,
                      items: section.items,
                      selectedPath: selectedPath,
                      onItemSelected: onDestinationSelected,
                      collapsed: collapsed,
                    );
                  },
                ),
              ),
              Divider(height: sectionGap, color: mizan.sidebarBorder),
              if (!collapsed) ...[
                _SidebarAction(
                  icon: context.watch<ThemeCubit>().state.isDark
                      ? Icons.light_mode_outlined
                      : Icons.dark_mode_outlined,
                  label: context.watch<ThemeCubit>().state.isDark
                      ? 'Light theme'
                      : 'Dark theme',
                  onTap: () => context.read<ThemeCubit>().toggle(),
                ),
                _SidebarAction(
                  icon: Icons.logout_rounded,
                  label: 'Logout',
                  onTap: () async {
                    await context.read<SessionCubit>().clear();
                    if (context.mounted) context.go(AppRoutes.login);
                  },
                ),
                const SizedBox(height: 8),
                UserProfileCard(
                  name: session.displayName.isEmpty
                      ? 'Signed in'
                      : session.displayName,
                  role: session.workspace?.role ?? '',
                  initials: session.initials,
                ),
              ] else ...[
                IconButton(
                  tooltip: 'Toggle theme',
                  onPressed: () => context.read<ThemeCubit>().toggle(),
                  icon: Icon(
                    context.watch<ThemeCubit>().state.isDark
                        ? Icons.light_mode_outlined
                        : Icons.dark_mode_outlined,
                    color: mizan.sidebarMuted,
                  ),
                ),
                IconButton(
                  tooltip: 'Logout',
                  onPressed: () async {
                    await context.read<SessionCubit>().clear();
                    if (context.mounted) context.go(AppRoutes.login);
                  },
                  icon: Icon(Icons.logout_rounded, color: mizan.sidebarMuted),
                ),
                CircleAvatar(
                  radius: 16,
                  backgroundColor: mizan.accent,
                  child: Text(
                    session.initials,
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: Colors.black,
                          fontSize: 11,
                        ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _WorkspaceBanner extends StatelessWidget {
  const _WorkspaceBanner({required this.name, required this.role});

  final String name;
  final String role;

  @override
  Widget build(BuildContext context) {
    final mizan = context.mizanTheme;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: mizan.sidebarSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: mizan.sidebarBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: mizan.sidebarText,
                  fontWeight: FontWeight.w700,
                ),
          ),
          if (role.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              role,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: mizan.sidebarMuted,
                  ),
            ),
          ],
        ],
      ),
    );
  }
}

class _SidebarAction extends StatelessWidget {
  const _SidebarAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final mizan = context.mizanTheme;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        splashColor: mizan.accent.withValues(alpha: 0.12),
        highlightColor: mizan.sidebarHover,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
          child: Row(
            children: [
              Icon(icon, color: mizan.sidebarMuted, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: mizan.sidebarMuted,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
