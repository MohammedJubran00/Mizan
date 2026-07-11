import 'package:flutter/material.dart';

import '../../../../core/theme/mizan_theme_extension.dart';

/// Shimmer-like skeleton block for independent loading states.
class SkeletonBox extends StatefulWidget {
  const SkeletonBox({
    super.key,
    this.width,
    this.height = 16,
    this.borderRadius = 10,
  });

  final double? width;
  final double height;
  final double borderRadius;

  @override
  State<SkeletonBox> createState() => _SkeletonBoxState();
}

class _SkeletonBoxState extends State<SkeletonBox>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = context.mizanTheme;
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            color: Color.lerp(
              theme.skeletonBase,
              theme.skeletonHighlight,
              _controller.value,
            ),
          ),
        );
      },
    );
  }
}

class StatCardSkeleton extends StatelessWidget {
  const StatCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return const DashboardSkeletonCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SkeletonBox(width: 40, height: 40, borderRadius: 12),
              Spacer(),
              SkeletonBox(width: 52, height: 22, borderRadius: 20),
            ],
          ),
          SizedBox(height: 20),
          SkeletonBox(width: 88, height: 12),
          SizedBox(height: 12),
          SkeletonBox(width: 120, height: 28),
          SizedBox(height: 10),
          SkeletonBox(width: 96, height: 12),
        ],
      ),
    );
  }
}

class DashboardSkeletonCard extends StatelessWidget {
  const DashboardSkeletonCard({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = context.mizanTheme;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.cardBackground,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: theme.cardBorder),
      ),
      child: child,
    );
  }
}

class ListSkeleton extends StatelessWidget {
  const ListSkeleton({super.key, this.rows = 4});

  final int rows;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(rows, (index) {
        return Padding(
          padding: EdgeInsets.only(bottom: index == rows - 1 ? 0 : 14),
          child: const Row(
            children: [
              SkeletonBox(width: 40, height: 40, borderRadius: 20),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SkeletonBox(width: double.infinity, height: 14),
                    SizedBox(height: 8),
                    SkeletonBox(width: 140, height: 12),
                  ],
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
