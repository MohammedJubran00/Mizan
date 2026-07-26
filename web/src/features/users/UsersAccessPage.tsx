import {
  AlertCircle,
  AlertTriangle,
  Ban,
  KeyRound,
  Plus,
  Shield,
  UserPlus,
  UserRound,
  UserX,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/EmptyState'
import { SearchBar } from '@/shared/components/SearchBar'
import { SectionCard } from '@/shared/components/SectionCard'
import { TabPanel, Tabs, type TabItem } from '@/shared/components/Tabs'
import { downloadCsv } from '@/shared/lib/csv'
import { formatDateTime, formatShortDate } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import { DeleteUserDialog } from './components/DeleteUserDialog'
import { InviteUserDialog } from './components/InviteUserDialog'
import { ResetPasswordDialog } from './components/ResetPasswordDialog'
import { SuspendUserDialog } from './components/SuspendUserDialog'
import { UsersListSkeleton } from './components/UsersSkeletons'
import { useUserListParams } from './hooks/useUserListParams'
import {
  useInvitations,
  useRoleList,
  useUserList,
  useUsersMutations,
} from './hooks/useUsersQueries'
import { departmentLabels } from './lib/labels'
import type { Invitation, UserListItem } from './types'

const TAB_IDS = ['active', 'pending', 'archived'] as const
type TabId = (typeof TAB_IDS)[number]

function isTabId(value: string | null): value is TabId {
  return value !== null && (TAB_IDS as readonly string[]).includes(value)
}

export function UsersAccessPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const listParams = useUserListParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeTab: TabId = isTabId(searchParams.get('tab'))
    ? (searchParams.get('tab') as TabId)
    : 'active'

  const statusForTab =
    activeTab === 'active'
      ? 'ACTIVE'
      : activeTab === 'archived'
        ? 'ARCHIVED'
        : 'ALL'

  const userQuery = useUserList({
    ...listParams.params,
    status: activeTab === 'pending' ? 'PENDING' : statusForTab,
  })

  const invitations = useInvitations({
    search: listParams.params.search,
    page: listParams.params.page,
    pageSize: listParams.params.pageSize,
  })

  const { items: roles } = useRoleList({ page: 1, pageSize: 100 })

  const [inviteOpen, setInviteOpen] = useState(false)
  const [demoDeleteOpen, setDemoDeleteOpen] = useState(false)
  const [demoSuspendOpen, setDemoSuspendOpen] = useState(false)
  const [demoResetOpen, setDemoResetOpen] = useState(false)

  const { inviteUser, importUsersCsv, isInviting } = useUsersMutations({
    onInvited: () => setInviteOpen(false),
  })

  const tabs: TabItem[] = [
    { id: 'active', label: 'Active members', count: userQuery.pagination?.total },
    {
      id: 'pending',
      label: 'Pending invitations',
      count: invitations.pagination?.total,
    },
    { id: 'archived', label: 'Archived' },
  ]

  function setTab(tab: string) {
    const next = new URLSearchParams(searchParams)
    if (tab === 'active') next.delete('tab')
    else next.set('tab', tab)
    setSearchParams(next, { replace: true })
  }

  const invitationColumns: DataTableColumn<Invitation>[] = useMemo(
    () => [
      {
        id: 'email',
        header: 'Email',
        render: (row) => (
          <span className="font-semibold text-navy">{row.email}</span>
        ),
      },
      {
        id: 'role',
        header: 'Role',
        render: (row) => (
          <span className="text-text-secondary">{row.roleName}</span>
        ),
      },
      {
        id: 'department',
        header: 'Department',
        render: (row) => (
          <span className="text-text-secondary">
            {departmentLabels[row.department]}
          </span>
        ),
      },
      {
        id: 'invited',
        header: 'Invited',
        render: (row) => (
          <span className="text-text-secondary">
            {formatDateTime(row.invitedAt)}
          </span>
        ),
      },
    ],
    [],
  )

  const archivedColumns: DataTableColumn<UserListItem>[] = [
    {
      id: 'name',
      header: 'User',
      render: (row) => (
        <div>
          <p className="font-semibold text-navy">{row.fullName}</p>
          <p className="text-xs text-text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      id: 'joined',
      header: 'Joined',
      render: (row) => (
        <span className="text-text-secondary">
          {formatShortDate(row.joinedAt)}
        </span>
      ),
    },
  ]

  function exportUsers() {
    if (userQuery.items.length === 0) {
      toast.info('Nothing to export', 'There are no users in this view.')
      return
    }
    downloadCsv(
      `users-access-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Name', 'Email', 'Role', 'Department', 'Status'],
      userQuery.items.map((item) => [
        item.fullName,
        item.email,
        item.roleName,
        departmentLabels[item.department],
        item.status,
      ]),
    )
    toast.success('Export ready', 'Users exported as CSV.')
  }

  return (
    <>
      <TopBar
        title="Users & access"
        subtitle="Manage team members, roles, and administrative permissions."
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="size-4" />
              Invite user
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
        <Breadcrumbs
          items={[
            { label: 'Settings', to: '/users-permissions' },
            { label: 'Users & access' },
          ]}
        />

        <Card className="p-4">
          <SearchBar
            value={listParams.searchInput}
            onChange={listParams.setSearchInput}
            placeholder="Search team members…"
            ariaLabel="Search team members"
            searching={userQuery.isSearching}
          />
        </Card>

        <Tabs
          idPrefix="access"
          items={tabs}
          value={activeTab}
          onChange={setTab}
        />

        <TabPanel idPrefix="access" id="active" active={activeTab === 'active'}>
          {userQuery.state === 'loading' ? <UsersListSkeleton /> : null}
          {userQuery.state === 'error' ? (
            <EmptyState
              icon={AlertCircle}
              title="Could not load members"
              description="Please try again."
              action={
                <Button variant="secondary" onClick={() => userQuery.refetch()}>
                  Retry
                </Button>
              }
            />
          ) : null}
          {userQuery.state === 'empty' ? (
            <EmptyState
              icon={UserX}
              title="No users found"
              description="Your legal team directory is currently empty. Start by adding your first paralegal, associate, or partner to begin collaborating on cases."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={() => navigate('/users-permissions/new')}>
                    Add first user
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Import CSV
                  </Button>
                </div>
              }
            />
          ) : null}
          {userQuery.state === 'ready' ? (
            <Card className="overflow-hidden p-4">
              <div className="mb-3 flex justify-end gap-2">
                <Button size="sm" variant="secondary" onClick={exportUsers}>
                  Export users
                </Button>
              </div>
              <ul className="divide-y divide-border-subtle">
                {userQuery.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                    <button
                      type="button"
                      className="min-w-0 text-left"
                      onClick={() =>
                        navigate(`/users-permissions/${item.id}`)
                      }
                    >
                      <p className="font-semibold text-navy">{item.fullName}</p>
                      <p className="text-xs text-text-muted">{item.email}</p>
                    </button>
                    <span className="text-xs text-text-secondary">
                      {item.roleName}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </TabPanel>

        <TabPanel
          idPrefix="access"
          id="pending"
          active={activeTab === 'pending'}
        >
          {invitations.state === 'loading' ? <UsersListSkeleton /> : null}
          {invitations.state === 'empty' ? (
            <EmptyState
              icon={UserPlus}
              title="No pending invitations"
              description="Invitations you send will appear here until they are accepted."
              action={
                <Button onClick={() => setInviteOpen(true)}>
                  Invite user
                </Button>
              }
            />
          ) : null}
          {invitations.state === 'ready' ? (
            <Card className="overflow-hidden">
              <DataTable
                caption="Pending invitations"
                columns={invitationColumns}
                rows={invitations.items}
                rowKey={(row) => row.id}
                empty={null}
              />
            </Card>
          ) : null}
        </TabPanel>

        <TabPanel
          idPrefix="access"
          id="archived"
          active={activeTab === 'archived'}
        >
          {userQuery.state === 'empty' ? (
            <EmptyState
              icon={UserRound}
              title="No archived users"
              description="Archived accounts will appear in this tab."
            />
          ) : null}
          {userQuery.state === 'ready' ? (
            <Card className="overflow-hidden">
              <DataTable
                caption="Archived users"
                columns={archivedColumns}
                rows={userQuery.items}
                rowKey={(row) => row.id}
                empty={null}
              />
            </Card>
          ) : null}
        </TabPanel>

        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Administrative interaction suite
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <SectionCard title="Delete operations" icon={AlertTriangle}>
              <p className="mb-3 text-sm text-text-secondary">
                Permanent removal of user records.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDemoDeleteOpen(true)}
              >
                Trigger delete modal
              </Button>
            </SectionCard>
            <SectionCard title="Account management" icon={Ban}>
              <p className="mb-3 text-sm text-text-secondary">
                Temporarily disable access.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDemoSuspendOpen(true)}
              >
                Trigger disable modal
              </Button>
            </SectionCard>
            <SectionCard title="Security controls" icon={Shield}>
              <p className="mb-3 text-sm text-text-secondary">
                Send password reset emails.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDemoResetOpen(true)}
              >
                <KeyRound className="size-4" />
                Trigger reset modal
              </Button>
            </SectionCard>
          </div>
        </section>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) importUsersCsv.mutate(file)
          event.target.value = ''
        }}
      />

      <InviteUserDialog
        open={inviteOpen}
        inviting={isInviting}
        roles={roles}
        onClose={() => setInviteOpen(false)}
        onInvite={(payload) => inviteUser.mutate(payload)}
      />

      <DeleteUserDialog
        open={demoDeleteOpen}
        userName="selected user"
        deleting={false}
        onCancel={() => setDemoDeleteOpen(false)}
        onConfirm={() => {
          setDemoDeleteOpen(false)
          toast.info(
            'Select a user first',
            'Open a profile or use the users table to delete a real record.',
          )
        }}
      />
      <SuspendUserDialog
        open={demoSuspendOpen}
        userName="selected user"
        suspending={false}
        onCancel={() => setDemoSuspendOpen(false)}
        onConfirm={() => {
          setDemoSuspendOpen(false)
          toast.info(
            'Select a user first',
            'Use the users table to suspend an account.',
          )
        }}
      />
      <ResetPasswordDialog
        open={demoResetOpen}
        userName="selected user"
        resetting={false}
        onCancel={() => setDemoResetOpen(false)}
        onConfirm={() => {
          setDemoResetOpen(false)
          toast.info(
            'Select a user first',
            'Use a user profile to send a password reset.',
          )
        }}
      />
    </>
  )
}
