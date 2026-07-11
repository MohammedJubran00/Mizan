import 'nav_destination.dart';

/// A labeled group of [NavDestination] items in the sidebar.
class NavSection {
  const NavSection({
    required this.id,
    required this.title,
    required this.items,
  });

  final String id;
  final String title;
  final List<NavDestination> items;
}
