import 'package:flutter/material.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/mizan_theme_extension.dart';

/// Single navigable row in the dashboard sidebar.
class SidebarItem extends StatefulWidget {
  const SidebarItem({
    super.key,
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
    this.badgeLabel,
    this.badgeCount,
    this.collapsed = false,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  final String? badgeLabel;
  final int? badgeCount;
  final bool collapsed;

  @override
  State<SidebarItem> createState() => _SidebarItemState();
}

class _SidebarItemState extends State<SidebarItem> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final height = AppDimensions.sidebarItemHeight(size);
    final radius = AppDimensions.sidebarItemRadius(size);
    final mizan = context.mizanTheme;
    final selected = widget.selected;
    final showHover = _hovered && !selected;

    return Padding(
      padding: EdgeInsets.symmetric(vertical: height * 0.06),
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        cursor: SystemMouseCursors.click,
        child: Tooltip(
          message: widget.collapsed ? widget.label : '',
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeOutCubic,
            height: height,
            decoration: BoxDecoration(
              color: selected
                  ? mizan.sidebarSelected
                  : showHover
                      ? mizan.sidebarHover
                      : Colors.transparent,
              borderRadius: BorderRadius.circular(radius),
              border: Border.all(
                color: selected
                    ? mizan.accent.withValues(alpha: 0.55)
                    : Colors.transparent,
                width: 1,
              ),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: widget.onTap,
                borderRadius: BorderRadius.circular(radius),
                splashColor: mizan.accent.withValues(alpha: 0.12),
                highlightColor: mizan.accent.withValues(alpha: 0.06),
                child: Stack(
                  children: [
                    if (selected)
                      Positioned(
                        left: 0,
                        top: height * 0.22,
                        bottom: height * 0.22,
                        child: Container(
                          width: 3,
                          decoration: BoxDecoration(
                            color: mizan.accent,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                    Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: widget.collapsed ? 0 : height * 0.28,
                      ),
                      child: Row(
                        mainAxisAlignment: widget.collapsed
                            ? MainAxisAlignment.center
                            : MainAxisAlignment.start,
                        children: [
                          Icon(
                            widget.icon,
                            size: height * 0.42,
                            color: selected
                                ? mizan.accent
                                : mizan.sidebarMuted,
                          ),
                          if (!widget.collapsed) ...[
                            SizedBox(width: height * 0.28),
                            Expanded(
                              child: Text(
                                widget.label,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                      fontSize: height * 0.32,
                                      fontWeight: selected
                                          ? FontWeight.w600
                                          : FontWeight.w500,
                                      color: selected
                                          ? mizan.sidebarText
                                          : mizan.sidebarMuted,
                                      letterSpacing: -0.1,
                                    ),
                              ),
                            ),
                            if (widget.badgeLabel != null) ...[
                              SizedBox(width: height * 0.12),
                              _PillBadge(label: widget.badgeLabel!),
                            ] else if (widget.badgeCount != null) ...[
                              SizedBox(width: height * 0.12),
                              _CountBadge(count: widget.badgeCount!),
                            ],
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _PillBadge extends StatelessWidget {
  const _PillBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final mizan = context.mizanTheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: mizan.accent,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelLarge?.copyWith(
              fontSize: 10,
              color: Colors.black,
              letterSpacing: 0.4,
            ),
      ),
    );
  }
}

class _CountBadge extends StatelessWidget {
  const _CountBadge({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    final mizan = context.mizanTheme;
    return Container(
      constraints: const BoxConstraints(minWidth: 22, minHeight: 22),
      padding: const EdgeInsets.symmetric(horizontal: 6),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: mizan.sidebarSurface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: mizan.sidebarBorder),
      ),
      child: Text(
        '$count',
        style: Theme.of(context).textTheme.labelLarge?.copyWith(
              fontSize: 11,
              color: mizan.sidebarMuted,
            ),
      ),
    );
  }
}
