import { Shield } from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Checkbox } from '@/shared/components/Checkbox'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/EmptyState'
import { cn } from '@/shared/lib/utils'

import {
  permissionActionLabels,
  permissionModuleLabels,
} from '../lib/labels'
import {
  hasPermission,
  selectAllPermissions,
  setModuleActions,
  togglePermission,
} from '../lib/permissions'
import type {
  Permission,
  PermissionAction,
  PermissionModule,
  Role,
} from '../types'
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from '../types'

interface PermissionMatrixProps {
  role: Role | null
  permissions: Permission[]
  dirty: boolean
  saving: boolean
  view: 'matrix' | 'list'
  onViewChange: (view: 'matrix' | 'list') => void
  onChange: (permissions: Permission[]) => void
  onSave: () => void
  onDiscard: () => void
}

export function PermissionMatrix({
  role,
  permissions,
  dirty,
  saving,
  view,
  onViewChange,
  onChange,
  onSave,
  onDiscard,
}: PermissionMatrixProps) {
  if (!role) {
    return (
      <Card className="p-5">
        <EmptyState
          icon={Shield}
          title="Select a role"
          description="Choose a role from the table above to configure its permissions matrix."
          className="border-0 py-10"
        />
      </Card>
    )
  }

  function toggle(module: PermissionModule, action: PermissionAction) {
    onChange(togglePermission(permissions, module, action))
  }

  function toggleModule(module: PermissionModule, enabled: boolean) {
    onChange(setModuleActions(permissions, module, enabled))
  }

  const columns: DataTableColumn<PermissionModule>[] = [
    {
      id: 'module',
      header: 'Module',
      render: (module) => (
        <span className="font-semibold text-navy">
          {permissionModuleLabels[module]}
        </span>
      ),
    },
    ...PERMISSION_ACTIONS.map((action) => ({
      id: action,
      header: permissionActionLabels[action],
      className: 'text-center',
      render: (module: PermissionModule) => (
        <div className="flex justify-center">
          <Checkbox
            checked={hasPermission(permissions, module, action)}
            onChange={() => toggle(module, action)}
            aria-label={`${permissionActionLabels[action]} ${permissionModuleLabels[module]}`}
          />
        </div>
      ),
    })),
  ]

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-navy">Permissions matrix</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Configure granular capabilities for the {role.name} role.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex rounded-lg border border-border p-1"
            role="tablist"
            aria-label="Permissions view"
          >
            {(['matrix', 'list'] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={view === option}
                onClick={() => onViewChange(option)}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs font-semibold capitalize',
                  view === option
                    ? 'bg-navy text-white'
                    : 'text-text-secondary hover:text-navy',
                )}
              >
                {option} view
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onChange(selectAllPermissions())}
          >
            Select all
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              onChange(
                PERMISSION_MODULES.map((module) => ({
                  module,
                  actions: [],
                })),
              )
            }
          >
            Reset
          </Button>
        </div>
      </div>

      {view === 'matrix' ? (
        <DataTable
          caption={`Permissions for ${role.name}`}
          columns={columns}
          rows={[...PERMISSION_MODULES]}
          rowKey={(module) => module}
          empty={null}
        />
      ) : (
        <ul className="divide-y divide-border-subtle">
          {PERMISSION_MODULES.map((module) => {
            const enabledCount =
              permissions.find((entry) => entry.module === module)?.actions
                .length ?? 0
            const allEnabled = enabledCount === PERMISSION_ACTIONS.length
            return (
              <li
                key={module}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-navy">
                    {permissionModuleLabels[module]}
                  </p>
                  <p className="text-xs text-text-muted">
                    {enabledCount} of {PERMISSION_ACTIONS.length} actions
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PERMISSION_ACTIONS.map((action) => (
                    <label
                      key={action}
                      className="inline-flex items-center gap-1.5 text-xs text-text-secondary"
                    >
                      <Checkbox
                        checked={hasPermission(permissions, module, action)}
                        onChange={() => toggle(module, action)}
                      />
                      {permissionActionLabels[action]}
                    </label>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleModule(module, !allEnabled)}
                  >
                    {allEnabled ? 'Clear' : 'All'}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t border-border-subtle px-5 py-4">
        <Button variant="ghost" disabled={!dirty || saving} onClick={onDiscard}>
          Discard changes
        </Button>
        <Button loading={saving} disabled={!dirty} onClick={onSave}>
          Save permissions
        </Button>
      </div>
    </Card>
  )
}

interface RoleTableProps {
  roles: Role[]
  selectedRoleId?: string | null
  empty: ReactNode
  onSelect: (role: Role) => void
  onEdit: (role: Role) => void
  onDuplicate: (role: Role) => void
  onArchive: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleTable({
  roles,
  selectedRoleId,
  empty,
  onSelect,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: RoleTableProps) {
  if (roles.length === 0) return <>{empty}</>

  const columns: DataTableColumn<Role>[] = [
    {
      id: 'name',
      header: 'Role name',
      render: (row) => (
        <div>
          <p className="font-semibold text-navy">{row.name}</p>
          {row.system ? (
            <Badge variant="info" className="mt-1">
              System
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      id: 'description',
      header: 'Description',
      className: 'hidden md:table-cell',
      render: (row) => (
        <span className="text-text-secondary">{row.description || '—'}</span>
      ),
    },
    {
      id: 'users',
      header: 'Users',
      className: 'text-right',
      render: (row) => (
        <span className="text-text-secondary">{row.usersCount}</span>
      ),
    },
    {
      id: 'permissions',
      header: 'Permissions',
      className: 'text-right',
      render: (row) => (
        <span className="text-text-secondary">{row.permissionsCount}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      render: (row) => (
        <div
          className="flex flex-wrap gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <Button size="sm" variant="ghost" onClick={() => onEdit(row)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDuplicate(row)}>
            Duplicate
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onArchive(row)}>
            Archive
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:bg-danger/10"
            disabled={row.system}
            onClick={() => onDelete(row)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Card className="overflow-hidden">
      <DataTable
        caption="Defined firm roles"
        columns={columns}
        rows={roles}
        rowKey={(row) => row.id}
        onRowClick={onSelect}
        rowClassName={(row) =>
          row.id === selectedRoleId ? 'bg-blue-soft/40' : undefined
        }
        empty={null}
      />
    </Card>
  )
}
