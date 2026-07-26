import {
  AlertCircle,
  Download,
  Filter,
  Plus,
  Search,
  Shield,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Badge } from '@/shared/components/Badge'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { SearchBar } from '@/shared/components/SearchBar'
import { Textarea } from '@/shared/components/Textarea'
import { downloadCsv } from '@/shared/lib/csv'
import { formatCount, formatDateTime } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import {
  PermissionMatrix,
  RoleTable,
} from './components/PermissionMatrix'
import { RolesSkeleton } from './components/UsersSkeletons'
import {
  useRoleList,
  useRolesSummary,
  useUsersMutations,
} from './hooks/useUsersQueries'
import { emptyPermissionMatrix } from './lib/permissions'
import type { Permission, Role, RolePayload } from './types'

export function RolesPage() {
  const [search, setSearch] = useState('')
  const { items, state, isSearching, refetch } = useRoleList({
    search: search.trim() || undefined,
    page: 1,
    pageSize: 100,
  })
  const { summary, isLoading: summaryLoading } = useRolesSummary()

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>(
    emptyPermissionMatrix(),
  )
  const [baseline, setBaseline] = useState<Permission[]>(emptyPermissionMatrix())
  const [view, setView] = useState<'matrix' | 'list'>('matrix')
  const [createOpen, setCreateOpen] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<Role | null>(null)
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')

  const selectedRole =
    items.find((role) => role.id === selectedRoleId) ?? null

  useEffect(() => {
    if (!selectedRole) return
    setPermissions(selectedRole.permissions)
    setBaseline(selectedRole.permissions)
  }, [selectedRole])

  const dirty = useMemo(
    () => JSON.stringify(permissions) !== JSON.stringify(baseline),
    [permissions, baseline],
  )

  const {
    createRole,
    updateRole,
    duplicateRole,
    archiveRole,
    deleteRole,
    updatePermissions,
    isSavingRole,
    isDeleting,
  } = useUsersMutations({
    onRoleSaved: () => {
      setCreateOpen(false)
      setEditRole(null)
    },
  })

  function openCreate() {
    setRoleName('')
    setRoleDescription('')
    setCreateOpen(true)
  }

  function openEdit(role: Role) {
    setEditRole(role)
    setRoleName(role.name)
    setRoleDescription(role.description)
    setSelectedRoleId(role.id)
  }

  function saveRoleForm() {
    if (!roleName.trim()) {
      toast.error('Name required', 'Enter a role name.')
      return
    }
    const payload: RolePayload = {
      name: roleName.trim(),
      description: roleDescription.trim(),
      permissions: editRole?.permissions ?? emptyPermissionMatrix(),
    }
    if (editRole) {
      updateRole.mutate({ id: editRole.id, payload })
      return
    }
    createRole.mutate(payload)
  }

  function exportRoles() {
    if (items.length === 0) {
      toast.info('Nothing to export', 'There are no roles to export.')
      return
    }
    downloadCsv(
      `roles-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Role', 'Description', 'Users', 'Permissions'],
      items.map((role) => [
        role.name,
        role.description,
        role.usersCount,
        role.permissionsCount,
      ]),
    )
    toast.success('Export ready', 'Roles exported as CSV.')
  }

  return (
    <>
      <TopBar
        title="Role management"
        subtitle="Define specialized access for teams and partners."
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={exportRoles}>
              <Download className="size-4" />
              Export CSV
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              Create role
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Role management', to: '/users-permissions/roles' },
            { label: 'Firm governance' },
          ]}
        />

        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            to="/users-permissions"
            className="font-medium text-blue hover:underline"
          >
            Users directory
          </Link>
          <Link
            to="/users-permissions/access"
            className="font-medium text-blue hover:underline"
          >
            Users & access
          </Link>
        </div>

        <Card className="p-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search roles or permissions…"
            ariaLabel="Search roles"
            searching={isSearching}
          />
        </Card>

        {state === 'loading' || summaryLoading ? <RolesSkeleton /> : null}

        {state === 'error' ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load roles"
            description="Something went wrong while loading firm roles."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : null}

        {state === 'empty' || state === 'ready' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                      Active roles
                    </p>
                    <p className="mt-2 font-display text-3xl text-navy">
                      {summary
                        ? formatCount(summary.activeRoles)
                        : items.length
                          ? formatCount(items.length)
                          : '—'}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {summary?.rolesAddedThisQuarter != null
                        ? `${formatCount(summary.rolesAddedThisQuarter)} added this quarter`
                        : 'No quarterly additions yet'}
                    </p>
                  </div>
                  <Shield className="size-5 text-blue" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                      Unique permissions
                    </p>
                    <p className="mt-2 font-display text-3xl text-navy">
                      {summary
                        ? formatCount(summary.uniquePermissions)
                        : '—'}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {summary?.lastAuditAt
                        ? `Last audit: ${formatDateTime(summary.lastAuditAt)}`
                        : 'No audit recorded'}
                    </p>
                  </div>
                  <ShieldCheck className="size-5 text-blue" />
                </div>
              </Card>
              <Card className="flex flex-col justify-between p-4">
                <div>
                  <h3 className="text-sm font-semibold text-navy">
                    Create new role
                  </h3>
                  <p className="mt-1 text-xs text-text-muted">
                    Define specialized access for teams or individual partners.
                  </p>
                </div>
                <Button size="sm" className="mt-4 self-start" onClick={openCreate}>
                  <Plus className="size-4" />
                  Create role
                </Button>
              </Card>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-navy">
                  Defined firm roles
                </h2>
                <Badge variant="neutral">System & custom</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">
                  <Filter className="size-4" />
                  Filter
                </Button>
                <Button size="sm" variant="secondary" onClick={exportRoles}>
                  <Download className="size-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            <RoleTable
              roles={items}
              selectedRoleId={selectedRoleId}
              onSelect={(role) => setSelectedRoleId(role.id)}
              onEdit={openEdit}
              onDuplicate={(role) => duplicateRole.mutate(role.id)}
              onArchive={(role) => archiveRole.mutate(role.id)}
              onDelete={(role) => setDeleteRoleTarget(role)}
              empty={
                <EmptyState
                  icon={Search}
                  title="No roles yet"
                  description="Create your first role to control module access across the firm."
                  action={
                    <Button onClick={openCreate}>
                      <Plus className="size-4" />
                      Create role
                    </Button>
                  }
                />
              }
            />

            <PermissionMatrix
              role={selectedRole}
              permissions={permissions}
              dirty={dirty}
              saving={isSavingRole}
              view={view}
              onViewChange={setView}
              onChange={setPermissions}
              onDiscard={() => setPermissions(baseline)}
              onSave={() => {
                if (!selectedRole) return
                updatePermissions.mutate({
                  roleId: selectedRole.id,
                  permissions,
                })
              }}
            />
          </>
        ) : null}
      </div>

      <Modal
        open={createOpen || editRole !== null}
        onClose={() => {
          setCreateOpen(false)
          setEditRole(null)
        }}
        title={editRole ? 'Edit role' : 'Create role'}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setCreateOpen(false)
                setEditRole(null)
              }}
            >
              Cancel
            </Button>
            <Button loading={isSavingRole} onClick={saveRoleForm}>
              {editRole ? 'Save role' : 'Create role'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Role name"
            required
            value={roleName}
            onChange={(event) => setRoleName(event.target.value)}
          />
          <Textarea
            label="Description"
            rows={3}
            value={roleDescription}
            onChange={(event) => setRoleDescription(event.target.value)}
          />
        </div>
      </Modal>

      <ConfirmationDialog
        open={deleteRoleTarget !== null}
        title="Delete role?"
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
        loading={deleteRole.isPending}
        onCancel={() => setDeleteRoleTarget(null)}
        onConfirm={() => {
          if (!deleteRoleTarget) return
          deleteRole.mutate(deleteRoleTarget.id, {
            onSuccess: () => {
              if (selectedRoleId === deleteRoleTarget.id) {
                setSelectedRoleId(null)
              }
              setDeleteRoleTarget(null)
            },
          })
        }}
      >
        Delete{' '}
        <strong className="font-semibold text-navy">
          {deleteRoleTarget?.name}
        </strong>
        ? Users assigned to this role may lose access.
      </ConfirmationDialog>
    </>
  )
}
