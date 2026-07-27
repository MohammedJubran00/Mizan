import {
  Bot,
  Briefcase,
  CalendarDays,
  CreditCard,
  FileText,
  Gavel,
  LayoutGrid,
  type LucideIcon,
  Settings,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'

export interface NavDestination {
  id: string
  path: string
  label: string
  description: string
  icon: LucideIcon
  badgeLabel?: string
}

export interface NavSection {
  id: string
  title: string
  items: NavDestination[]
}

export const navSections: NavSection[] = [
  {
    id: 'workspace',
    title: 'Workspace',
    items: [
      {
        id: 'dashboard',
        path: '/dashboard',
        label: 'Dashboard',
        description:
          'Overview of your practice activity, deadlines, and priorities.',
        icon: LayoutGrid,
      },
      {
        id: 'ai-assistant',
        path: '/ai-assistant',
        label: 'AI Assistant',
        description:
          'Ask Mizan AI for research, drafting help, and case insights.',
        icon: Bot,
        badgeLabel: 'AI',
      },
    ],
  },
  {
    id: 'practice',
    title: 'Practice',
    items: [
      {
        id: 'clients',
        path: '/clients',
        label: 'Clients',
        description: 'Manage client profiles, contacts, and matter history.',
        icon: Users,
      },
      {
        id: 'cases',
        path: '/cases',
        label: 'Cases',
        description: 'Track open matters, status, and case milestones.',
        icon: Briefcase,
      },
      {
        id: 'hearings',
        path: '/hearings',
        label: 'Hearings',
        description: 'Upcoming hearings, venues, and appearance notes.',
        icon: Gavel,
      },
      {
        id: 'calendar',
        path: '/calendar',
        label: 'Calendar',
        description: 'Schedule court dates, meetings, and firm events.',
        icon: CalendarDays,
      },
      {
        id: 'documents',
        path: '/documents',
        label: 'Documents',
        description: 'Organize filings, contracts, and shared work product.',
        icon: FileText,
      },
      {
        id: 'billing',
        path: '/billing',
        label: 'Billing',
        description: 'Invoices, time entries, and payment status.',
        icon: CreditCard,
      },
    ],
  },
  {
    id: 'administration',
    title: 'Administration',
    items: [
      {
        id: 'reports',
        path: '/reports',
        label: 'Reports',
        description: 'Practice analytics and performance summaries.',
        icon: TrendingUp,
      },
      {
        id: 'users-permissions',
        path: '/users-permissions',
        label: 'Users & Permissions',
        description: 'Invite colleagues and manage role-based access.',
        icon: UserPlus,
      },
      {
        id: 'security-logs',
        path: '/security-logs',
        label: 'Security Logs',
        description: 'Review authentication and access activity.',
        icon: Shield,
      },
      {
        id: 'settings',
        path: '/settings',
        label: 'Settings',
        description: 'Firm preferences, notifications, and workspace setup.',
        icon: Settings,
      },
    ],
  },
]

export const allNavDestinations = navSections.flatMap((section) => section.items)

export function getNavByPath(path: string) {
  return allNavDestinations.find((item) => item.path === path)
}

/** Paths backed by a fully implemented feature screen. */
export const implementedPaths = [
  '/dashboard',
  '/clients',
  '/cases',
  '/hearings',
  '/calendar',
  '/documents',
  '/billing',
  '/reports',
  '/users-permissions',
]

/** Destinations still rendering the shared "Coming soon" screen. */
export const placeholderPaths = allNavDestinations
  .filter((item) => !implementedPaths.includes(item.path))
  .map((item) => item.path)

export const shellPaths = allNavDestinations.map((item) => item.path)
