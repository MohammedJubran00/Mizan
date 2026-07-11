import 'package:flutter/material.dart';

import '../../../core/constants/app_strings.dart';
import '../domain/entities/nav_destination.dart';
import '../domain/entities/nav_section.dart';

/// Static navigation catalog for the dashboard shell (UI-only, no backend).
abstract final class DashboardNavData {
  static const List<NavSection> sections = [
    NavSection(
      id: 'workspace',
      title: AppStrings.workspace,
      items: [
        NavDestination(
          id: 'dashboard',
          path: '/dashboard',
          label: AppStrings.dashboard,
          description:
              'Overview of your practice activity, deadlines, and priorities.',
          icon: Icons.grid_view_rounded,
        ),
        NavDestination(
          id: 'ai-assistant',
          path: '/ai-assistant',
          label: AppStrings.aiAssistant,
          description:
              'Ask Mizan AI for research, drafting help, and case insights.',
          icon: Icons.auto_awesome_outlined,
          badgeLabel: 'AI',
        ),
      ],
    ),
    NavSection(
      id: 'practice',
      title: AppStrings.practice,
      items: [
        NavDestination(
          id: 'clients',
          path: '/clients',
          label: AppStrings.clients,
          description: 'Manage client profiles, contacts, and matter history.',
          icon: Icons.people_outline_rounded,
        ),
        NavDestination(
          id: 'cases',
          path: '/cases',
          label: AppStrings.cases,
          description: 'Track open matters, status, and case milestones.',
          icon: Icons.work_outline_rounded,
          badgeCount: 9,
        ),
        NavDestination(
          id: 'hearings',
          path: '/hearings',
          label: AppStrings.hearings,
          description: 'Upcoming hearings, venues, and appearance notes.',
          icon: Icons.verified_user_outlined,
        ),
        NavDestination(
          id: 'calendar',
          path: '/calendar',
          label: AppStrings.calendar,
          description: 'Schedule court dates, meetings, and firm events.',
          icon: Icons.calendar_today_outlined,
        ),
        NavDestination(
          id: 'documents',
          path: '/documents',
          label: AppStrings.documents,
          description: 'Organize filings, contracts, and shared work product.',
          icon: Icons.description_outlined,
          badgeCount: 12,
        ),
        NavDestination(
          id: 'billing',
          path: '/billing',
          label: AppStrings.billing,
          description: 'Invoices, time entries, and payment status.',
          icon: Icons.credit_card_outlined,
        ),
      ],
    ),
    NavSection(
      id: 'administration',
      title: AppStrings.administration,
      items: [
        NavDestination(
          id: 'reports',
          path: '/reports',
          label: AppStrings.reports,
          description: 'Practice analytics and performance summaries.',
          icon: Icons.trending_up_rounded,
        ),
        NavDestination(
          id: 'users-permissions',
          path: '/users-permissions',
          label: AppStrings.usersPermissions,
          description: 'Invite colleagues and manage role-based access.',
          icon: Icons.person_add_alt_1_outlined,
        ),
        NavDestination(
          id: 'security-logs',
          path: '/security-logs',
          label: AppStrings.securityLogs,
          description: 'Review authentication and access activity.',
          icon: Icons.shield_outlined,
        ),
        NavDestination(
          id: 'settings',
          path: '/settings',
          label: AppStrings.settings,
          description: 'Firm preferences, notifications, and workspace setup.',
          icon: Icons.settings_outlined,
        ),
      ],
    ),
  ];

  static List<NavDestination> get allDestinations =>
      sections.expand((section) => section.items).toList(growable: false);

  static NavDestination? byPath(String path) {
    for (final destination in allDestinations) {
      if (destination.path == path) return destination;
    }
    return null;
  }

  static NavDestination get defaultDestination => allDestinations.first;
}
