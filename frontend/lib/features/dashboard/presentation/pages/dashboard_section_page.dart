import 'package:flutter/material.dart';

import '../../domain/entities/nav_destination.dart';
import '../widgets/page_container.dart';

/// Placeholder content page for a dashboard [NavDestination].
class DashboardSectionPage extends StatelessWidget {
  const DashboardSectionPage({
    super.key,
    required this.destination,
  });

  final NavDestination destination;

  @override
  Widget build(BuildContext context) {
    return PageContainer(
      title: destination.label,
      description: destination.description,
      icon: destination.icon,
    );
  }
}
