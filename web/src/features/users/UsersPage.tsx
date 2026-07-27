import {
  AlertCircle,
  Download,
  Plus,
  Search,
  UserPlus,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { SearchBar } from '@/shared/components/SearchBar'
import { Select } from '@/shared/components/Select'
import { useRowSelection } from '@/shared/hooks/useRowSelection'
import { downloadCsv } from '@/shared/lib/csv'
import { formatCount } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import { ActivateUserDialog } from './components/ActivateUserDialog'
import { DeleteUserDialog } from './components/DeleteUserDialog'
import { InviteUserDialog } from './components/InviteUserDialog'
import { ResetPasswordDialog } from './components/ResetPasswordDialog'
import { SuspendUserDialog } from './components/SuspendUserDialog'
import { UsersListSkeleton } from './components/UsersSkeletons'
import { UsersStats } from './components/UsersStats'
import { UsersTable } from './components/UsersTable'
import { useUserListParams } from './hooks/useUserListParams'
import {
  useRoleList,
  useUserList,
  useUsersMutations,
  useUsersSummary,
} from './hooks/useUsersQueries'
import {
  departmentLabels,
  departmentOptions,
  statusFilterOptions,
  userStatusLabels,
} from './lib/labels'
import type { UserListItem } from './types'

const EXPORT_HEADERS = [
  'Full name',
  'Email',
  'Role',
  'Department',
  'Cases',
  'Last login',
  'Status',
]

function toExportRow(item: UserListItem) {
  return [
    item.fullName,
    item.email,
    item.roleName,
    departmentLabels[item.department],
    item.assignedCasesCount,
    item.lastLoginAt ?? '',
    userStatusLabels[item.status],
  ]
}

export function UsersPage() {
  const navigate = useNavigate()
  const listParams = useUserListParams()
  const { items, pagination, state, isSearching, refetch } = useUserList(
    listParams.params,
  )
  const { summary, isLoading: summaryLoading } = useUsersSummary()
  const { items: roles } = useRoleList({ page: 1, pageSize: 100 })

  const keys = useMemo(() => items.map((item) => item.id), [items])
  const selection = useRowSelection(keys)

  const [inviteOpen, setInviteOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<UserListItem | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [pendingSuspend, setPendingSuspend] = useState<UserListItem | null>(null)
  const [bulkSuspendOpen, setBulkSuspendOpen] = useState(false)
  const [pendingActivate, setPendingActivate] = useState<UserListItem | null>(
    null,
  )
  const [bulkActivateOpen, setBulkActivateOpen] = useState(false)
  const [pendingReset, setPendingReset] = useState<UserListItem | null>(null)

  const {
    deleteUser,
    deleteUsers,
    suspendUser,
    suspendUsers,
    activateUser,
    activateUsers,
    resetPassword,
    inviteUser,
    isDeleting,
    isSuspending,
    isActivating,
    isResetting,
    isInviting,
  } = useUsersMutations({
    onDeleted: () => {
      setPendingDelete(null)
      setBulkDeleteOpen(false)
      selection.clear()
    },
    onUpdated: () => {
      setPendingSuspend(null)
      setPendingActivate(null)
      setBulkSuspendOpen(false)
      setBulkActivateOpen(false)
      selection.clear()
    },
    onInvited: () => setInviteOpen(false),
  })

  function exportRows(rows: UserListItem[]) {
    if (rows.length === 0) {
      toast.info('Nothing to export', 'There are no users matching this view.')
      return
    }
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`users-${stamp}.csv`, EXPORT_HEADERS, rows.map(toExportRow))
    toast.success(
      'Export ready',
      `${rows.length} ${rows.length === 1 ? 'user' : 'users'} exported as CSV.`,
    )
  }

  const roleOptions = [
    { value: 'ALL', label: 'All roles' },
    ...roles.map((role) => ({ value: role.id, label: role.name })),
  ]

  return (
    <>
      <TopBar
        title="Users"
        subtitle="Manage firm members, roles, and access permissions."
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => exportRows(items)}
              disabled={items.length === 0}
            >
              <Download className="size-4" />
              Export
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="size-4" />
              Invite
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/users-permissions/new')}
            >
              <Plus className="size-4" />
              Add user
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { label: 'Manage', to: '/users-permissions' },
              { label: 'Users' },
            ]}
          />
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              to="/users-permissions/access"
              className="font-medium text-blue hover:underline"
            >
              Users & access
            </Link>
            <Link
              to="/users-permissions/roles"
              className="font-medium text-blue hover:underline"
            >
              Role management
            </Link>
          </div>
        </div>

        <UsersStats summary={summary} loading={summaryLoading} />

        <Card className="space-y-4 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
            <div className="min-w-0 flex-1">
              <SearchBar
                value={listParams.searchInput}
                onChange={listParams.setSearchInput}
                placeholder="Search team members…"
                ariaLabel="Search users"
                searching={isSearching}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:w-[36rem]">
              <Select
                label="Role"
                options={roleOptions}
                value={listParams.roleId}
                onChange={(event) => listParams.setRoleId(event.target.value)}
              />
              <Select
                label="Department"
                options={[
                  { value: 'ALL', label: 'All departments' },
                  ...departmentOptions,
                ]}
                value={listParams.department}
                onChange={(event) =>
                  listParams.setDepartment(event.target.value)
                }
              />
              <Select
                label="Status"
                options={statusFilterOptions}
                value={listParams.status}
                onChange={(event) => listParams.setStatus(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-text-muted">
              {pagination
                ? `Showing ${formatCount((pagination.page - 1) * pagination.pageSize + (items.length ? 1 : 0))}–${formatCount(Math.min(pagination.page * pagination.pageSize, pagination.total))} of ${formatCount(pagination.total)} users`
                : 'No users loaded'}
            </p>
            {listParams.hasActiveFilters ? (
              <Button size="sm" variant="ghost" onClick={listParams.reset}>
                Clear filters
              </Button>
            ) : null}
          </div>
        </Card>

        {state === 'loading' ? <UsersListSkeleton /> : null}

        {state === 'error' ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load users"
            description="Something went wrong while loading the directory. Please try again."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : null}

        {state === 'empty' || state === 'ready' ? (
          <UsersTable
            items={items}
            selection={selection}
            pagination={pagination}
            onPageChange={listParams.setPage}
            onView={(item) => navigate(`/users-permissions/${item.id}`)}
            onEdit={(item) => navigate(`/users-permissions/${item.id}/edit`)}
            onSuspend={(item) => setPendingSuspend(item)}
            onActivate={(item) => setPendingActivate(item)}
            onResetPassword={(item) => setPendingReset(item)}
            onDelete={(item) => setPendingDelete(item)}
            onBulkDelete={() => setBulkDeleteOpen(true)}
            onBulkSuspend={() => setBulkSuspendOpen(true)}
            onBulkActivate={() => setBulkActivateOpen(true)}
            empty={
              listParams.hasActiveFilters ? (
                <EmptyState
                  icon={Search}
                  title="No matching users"
                  description="No team members match your current search and filters."
                  action={
                    <Button variant="secondary" onClick={listParams.reset}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={UserRound}
                  title="No users found"
                  description="Your legal team directory is currently empty. Start by adding your first paralegal, associate, or partner."
                  action={
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        onClick={() => navigate('/users-permissions/new')}
                      >
                        <Plus className="size-4" />
                        Add first user
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setInviteOpen(true)}
                      >
                        Invite user
                      </Button>
                    </div>
                  }
                />
              )
            }
          />
        ) : null}
      </div>

      <InviteUserDialog
        open={inviteOpen}
        inviting={isInviting}
        roles={roles}
        onClose={() => setInviteOpen(false)}
        onInvite={(payload) => inviteUser.mutate(payload)}
      />

      <DeleteUserDialog
        open={pendingDelete !== null}
        userName={pendingDelete?.fullName ?? ''}
        deleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteUser.mutate(pendingDelete.id)
        }}
      />

      <DeleteUserDialog
        open={bulkDeleteOpen}
        userName=""
        bulkCount={selection.count}
        deleting={isDeleting}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={() => deleteUsers.mutate(selection.selected)}
      />

      <SuspendUserDialog
        open={pendingSuspend !== null}
        userName={pendingSuspend?.fullName ?? ''}
        suspending={isSuspending}
        onCancel={() => setPendingSuspend(null)}
        onConfirm={() => {
          if (pendingSuspend) suspendUser.mutate(pendingSuspend.id)
        }}
      />

      <SuspendUserDialog
        open={bulkSuspendOpen}
        userName=""
        bulkCount={selection.count}
        suspending={isSuspending}
        onCancel={() => setBulkSuspendOpen(false)}
        onConfirm={() => suspendUsers.mutate(selection.selected)}
      />

      <ActivateUserDialog
        open={pendingActivate !== null}
        userName={pendingActivate?.fullName ?? ''}
        activating={isActivating}
        onCancel={() => setPendingActivate(null)}
        onConfirm={() => {
          if (pendingActivate) activateUser.mutate(pendingActivate.id)
        }}
      />

      <ActivateUserDialog
        open={bulkActivateOpen}
        userName=""
        bulkCount={selection.count}
        activating={isActivating}
        onCancel={() => setBulkActivateOpen(false)}
        onConfirm={() => activateUsers.mutate(selection.selected)}
      />

      <ResetPasswordDialog
        open={pendingReset !== null}
        userName={pendingReset?.fullName ?? ''}
        resetting={isResetting}
        onCancel={() => setPendingReset(null)}
        onConfirm={() => {
          if (pendingReset) {
            resetPassword.mutate(pendingReset.id, {
              onSuccess: () => setPendingReset(null),
            })
          }
        }}
      />
    </>
  )
}
