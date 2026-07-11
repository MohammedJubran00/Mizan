import 'package:flutter/material.dart';

/// A single sidebar destination in the dashboard shell.
class NavDestination {
  const NavDestination({
    required this.id,
    required this.path,
    required this.label,
    required this.description,
    required this.icon,
    this.badgeLabel,
    this.badgeCount,
  });

  final String id;
  final String path;
  final String label;
  final String description;
  final IconData icon;

  /// Optional pill badge text (e.g. "AI").
  final String? badgeLabel;

  /// Optional numeric notification count.
  final int? badgeCount;
}
