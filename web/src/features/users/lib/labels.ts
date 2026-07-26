import type { BadgeVariant } from '@/shared/components/Badge'

import type {
  Department,
  PermissionAction,
  PermissionModule,
  UserStatus,
} from '../types'

export const userStatusLabels: Record<UserStatus, string> = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  SUSPENDED: 'Suspended',
  ARCHIVED: 'Archived',
}

export const userStatusVariants: Record<UserStatus, BadgeVariant> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  SUSPENDED: 'danger',
  ARCHIVED: 'neutral',
}

export const departmentLabels: Record<Department, string> = {
  LITIGATION: 'Litigation',
  CORPORATE: 'Corporate',
  OPERATIONS: 'Operations',
  FINANCE: 'Finance',
  HR: 'HR',
  IT: 'IT',
  OTHER: 'Other',
}

export const permissionModuleLabels: Record<PermissionModule, string> = {
  DASHBOARD: 'Dashboard',
  CLIENTS: 'Clients',
  CASES: 'Cases',
  DOCUMENTS: 'Documents',
  BILLING: 'Billing',
  SETTINGS: 'Settings',
  REPORTS: 'Reports',
  USERS: 'Users',
}

export const permissionActionLabels: Record<PermissionAction, string> = {
  VIEW: 'View',
  CREATE: 'Create',
  EDIT: 'Edit',
  DELETE: 'Delete',
  EXPORT: 'Export',
  MANAGE: 'Manage',
}

export const departmentOptions = (
  Object.entries(departmentLabels) as Array<[Department, string]>
).map(([value, label]) => ({ value, label }))

export const statusFilterOptions = [
  { value: 'ALL', label: 'Status: All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'ARCHIVED', label: 'Archived' },
]
