export const USER_STATUSES = [
  'ACTIVE',
  'PENDING',
  'SUSPENDED',
  'ARCHIVED',
] as const

export type UserStatus = (typeof USER_STATUSES)[number]

export const DEPARTMENTS = [
  'LITIGATION',
  'CORPORATE',
  'OPERATIONS',
  'FINANCE',
  'HR',
  'IT',
  'OTHER',
] as const

export type Department = (typeof DEPARTMENTS)[number]

export const PERMISSION_ACTIONS = [
  'VIEW',
  'CREATE',
  'EDIT',
  'DELETE',
  'EXPORT',
  'MANAGE',
] as const

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number]

export const PERMISSION_MODULES = [
  'DASHBOARD',
  'CLIENTS',
  'CASES',
  'DOCUMENTS',
  'BILLING',
  'SETTINGS',
  'REPORTS',
  'USERS',
] as const

export type PermissionModule = (typeof PERMISSION_MODULES)[number]

export interface Permission {
  module: PermissionModule
  actions: PermissionAction[]
}

export interface Role {
  id: string
  name: string
  description: string
  usersCount: number
  permissionsCount: number
  permissions: Permission[]
  system?: boolean
  archived?: boolean
  createdAt: string
  updatedAt: string
}

export interface RolePayload {
  name: string
  description: string
  permissions: Permission[]
}

export interface Skill {
  id: string
  label: string
}

export interface Certification {
  id: string
  label: string
  issuedAt?: string | null
}

export interface UserActivity {
  id: string
  title: string
  description?: string | null
  occurredAt: string
}

export interface SecuritySettings {
  mfaEnabled: boolean
  lastPasswordChangeAt?: string | null
  sessionsCount: number
}

export interface UserCaseRef {
  id: string
  caseNumber: string
  title: string
  status: string
}

export interface UserListItem {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
  roleId: string
  roleName: string
  department: Department
  jobTitle?: string | null
  status: UserStatus
  assignedCasesCount: number
  lastLoginAt?: string | null
  joinedAt: string
  online?: boolean
}

export interface UserProfile extends UserListItem {
  bio?: string | null
  practiceArea?: string | null
  officeLocation?: string | null
  skills: Skill[]
  certifications: Certification[]
  permissions: Permission[]
  activities: UserActivity[]
  assignedCases: UserCaseRef[]
  security: SecuritySettings
  stats: {
    assignedCases: number
    completedCases: number
    hearingsScheduled: number
    documentsProcessed: number
    assignedCasesTrend: number | null
    completedCasesTrend: number | null
    hearingsTrend: number | null
    documentsTrend: number | null
  }
}

export interface UserPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  department: Department
  roleId: string
  jobTitle: string
  status: UserStatus
  password?: string
  bio?: string
  practiceArea?: string
  officeLocation?: string
  skills?: string[]
  sendInvite?: boolean
}

export interface Invitation {
  id: string
  email: string
  roleId: string
  roleName: string
  department: Department
  message?: string | null
  invitedAt: string
  expiresAt?: string | null
  status: 'PENDING' | 'EXPIRED' | 'ACCEPTED'
}

export interface InviteUserPayload {
  email: string
  roleId: string
  department: Department
  message?: string
}

export interface UsersSummary {
  totalUsers: number
  activeUsers: number
  pendingInvitations: number
  suspendedUsers: number
  onlineNow: number
  totalTrendThisMonth: number | null
}

export interface RolesSummary {
  activeRoles: number
  uniquePermissions: number
  rolesAddedThisQuarter: number | null
  lastAuditAt?: string | null
}

export interface UsersPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface UserListResponse {
  items: UserListItem[]
  pagination: UsersPagination
}

export interface InvitationListResponse {
  items: Invitation[]
  pagination: UsersPagination
}

export interface RoleListResponse {
  items: Role[]
  pagination: UsersPagination
}
