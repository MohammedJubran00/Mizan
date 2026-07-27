import type { Permission, PermissionAction, PermissionModule } from '../types'
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from '../types'

export function emptyPermissionMatrix(): Permission[] {
  return PERMISSION_MODULES.map((module) => ({
    module,
    actions: [],
  }))
}

export function hasPermission(
  permissions: Permission[],
  module: PermissionModule,
  action: PermissionAction,
) {
  return (
    permissions
      .find((entry) => entry.module === module)
      ?.actions.includes(action) ?? false
  )
}

export function togglePermission(
  permissions: Permission[],
  module: PermissionModule,
  action: PermissionAction,
): Permission[] {
  const existing = permissions.find((entry) => entry.module === module)
  if (!existing) {
    return [...permissions, { module, actions: [action] }]
  }

  const actions = existing.actions.includes(action)
    ? existing.actions.filter((item) => item !== action)
    : [...existing.actions, action]

  return permissions.map((entry) =>
    entry.module === module ? { ...entry, actions } : entry,
  )
}

export function setModuleActions(
  permissions: Permission[],
  module: PermissionModule,
  enabled: boolean,
): Permission[] {
  const actions = enabled ? [...PERMISSION_ACTIONS] : []
  const existing = permissions.find((entry) => entry.module === module)
  if (!existing) return [...permissions, { module, actions }]
  return permissions.map((entry) =>
    entry.module === module ? { ...entry, actions } : entry,
  )
}

export function countPermissions(permissions: Permission[]) {
  return permissions.reduce((sum, entry) => sum + entry.actions.length, 0)
}

export function selectAllPermissions(): Permission[] {
  return PERMISSION_MODULES.map((module) => ({
    module,
    actions: [...PERMISSION_ACTIONS],
  }))
}
