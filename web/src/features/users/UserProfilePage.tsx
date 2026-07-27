import {
  AlertCircle,
  Ban,
  Briefcase,
  CheckCircle2,
  FileText,
  Gavel,
  KeyRound,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Avatar } from '@/shared/components/Avatar'
import { Badge } from '@/shared/components/Badge'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { DropdownMenu } from '@/shared/components/DropdownMenu'
import { EmptyState } from '@/shared/components/EmptyState'
import { InfoCard } from '@/shared/components/InfoCard'
import { MetricCard } from '@/shared/components/MetricCard'
import { SectionCard } from '@/shared/components/SectionCard'
import { TabPanel, Tabs, type TabItem } from '@/shared/components/Tabs'
import {
  formatCount,
  formatDateTime,
  formatPercent,
  formatShortDate,
} from '@/shared/lib/utils'

import { ActivateUserDialog } from './components/ActivateUserDialog'
import { DeleteUserDialog } from './components/DeleteUserDialog'
import { ResetPasswordDialog } from './components/ResetPasswordDialog'
import { SuspendUserDialog } from './components/SuspendUserDialog'
import { UserProfileSkeleton } from './components/UsersSkeletons'
import {
  useUserDetails,
  useUsersMutations,
} from './hooks/useUsersQueries'
import {
  departmentLabels,
  permissionActionLabels,
  permissionModuleLabels,
  userStatusLabels,
  userStatusVariants,
} from './lib/labels'
import type { UserCaseRef } from './types'

const TAB_IDS = [
  'overview',
  'cases',
  'permissions',
  'activity',
  'security',
] as const
type TabId = (typeof TAB_IDS)[number]

function isTabId(value: string | null): value is TabId {
  return value !== null && (TAB_IDS as readonly string[]).includes(value)
}

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, state, refetch } = useUserDetails(userId)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const {
    deleteUser,
    suspendUser,
    activateUser,
    resetPassword,
    isDeleting,
    isSuspending,
    isActivating,
    isResetting,
  } = useUsersMutations({
    onDeleted: () => navigate('/users-permissions', { replace: true }),
    onUpdated: () => {
      setSuspendOpen(false)
      setActivateOpen(false)
    },
  })

  const activeTab: TabId = isTabId(searchParams.get('tab'))
    ? (searchParams.get('tab') as TabId)
    : 'overview'

  const setActiveTab = useCallback(
    (tab: string) => {
      const next = new URLSearchParams(searchParams)
      if (tab === 'overview') next.delete('tab')
      else next.set('tab', tab)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  if (state === 'loading') {
    return (
      <>
        <TopBar title="User profile" subtitle="Loading…" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <UserProfileSkeleton />
        </div>
      </>
    )
  }

  if (state === 'error') {
    return (
      <>
        <TopBar title="User profile" subtitle="Team member details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load user"
            description="Something went wrong while loading this profile."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      </>
    )
  }

  if (state === 'empty' || user === null) {
    return (
      <>
        <TopBar title="User profile" subtitle="Team member details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={UserRound}
            title="User not found"
            description="Select a team member from the users directory."
            action={
              <Button
                variant="secondary"
                onClick={() => navigate('/users-permissions')}
              >
                Browse users
              </Button>
            }
          />
        </div>
      </>
    )
  }

  const current = user
  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    {
      id: 'cases',
      label: 'Assigned cases',
      count: current.assignedCases.length,
    },
    { id: 'permissions', label: 'Permissions' },
    { id: 'activity', label: 'Activity', count: current.activities.length },
    { id: 'security', label: 'Security' },
  ]

  const caseColumns: DataTableColumn<UserCaseRef>[] = [
    {
      id: 'case',
      header: 'Case',
      render: (row) => (
        <div>
          <p className="font-mono text-xs text-blue">{row.caseNumber}</p>
          <p className="font-semibold text-navy">{row.title}</p>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => <Badge variant="neutral">{row.status}</Badge>,
    },
  ]

  function trendLabel(value: number | null) {
    if (value == null) return '—'
    if (value === 0) return 'Stable'
    return `${value > 0 ? '+' : ''}${formatPercent(value)}`
  }

  return (
    <>
      <TopBar
        title={current.fullName}
        subtitle={current.jobTitle || current.roleName}
        actions={
          <>
            <Button
              size="sm"
              onClick={() => navigate(`/users-permissions/${current.id}/edit`)}
            >
              <Pencil className="size-4" />
              Edit profile
            </Button>
            <DropdownMenu
              triggerLabel="More profile actions"
              trigger={<MoreHorizontal className="size-4" />}
              items={[
                current.status === 'SUSPENDED'
                  ? {
                      id: 'activate',
                      label: 'Activate',
                      icon: CheckCircle2,
                      onSelect: () => setActivateOpen(true),
                    }
                  : {
                      id: 'suspend',
                      label: 'Suspend',
                      icon: Ban,
                      onSelect: () => setSuspendOpen(true),
                    },
                {
                  id: 'reset',
                  label: 'Reset password',
                  icon: KeyRound,
                  onSelect: () => setResetOpen(true),
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  icon: Trash2,
                  tone: 'danger',
                  onSelect: () => setDeleteOpen(true),
                },
              ]}
            />
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Settings', to: '/users-permissions' },
            { label: `User profile: ${current.fullName}` },
          ]}
        />

        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <Avatar
            name={current.fullName}
            src={current.avatarUrl ?? undefined}
            size="lg"
            online={current.online}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl text-navy">
                {current.fullName}
              </h1>
              <Badge variant={userStatusVariants[current.status]}>
                {userStatusLabels[current.status]}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {current.jobTitle || current.roleName}
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-muted">
              {current.practiceArea ? (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="size-3.5" />
                  {current.practiceArea}
                </span>
              ) : null}
              {current.officeLocation ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {current.officeLocation}
                </span>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <InfoCard
            title="Account information"
            items={[
              { label: 'Email address', value: current.email, href: `mailto:${current.email}` },
              { label: 'Phone number', value: current.phone },
              {
                label: 'Department',
                value: departmentLabels[current.department],
              },
              { label: 'Job title', value: current.jobTitle },
              { label: 'Joined', value: formatShortDate(current.joinedAt) },
              {
                label: 'Last login',
                value: current.lastLoginAt
                  ? formatDateTime(current.lastLoginAt)
                  : 'Never',
              },
            ]}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Assigned cases"
              value={formatCount(current.stats.assignedCases)}
              icon={Briefcase}
              hint={trendLabel(current.stats.assignedCasesTrend)}
            />
            <MetricCard
              label="Completed cases"
              value={formatCount(current.stats.completedCases)}
              icon={CheckCircle2}
              hint={trendLabel(current.stats.completedCasesTrend)}
            />
            <MetricCard
              label="Hearings scheduled"
              value={formatCount(current.stats.hearingsScheduled)}
              icon={Gavel}
              hint={trendLabel(current.stats.hearingsTrend)}
            />
            <MetricCard
              label="Documents processed"
              value={formatCount(current.stats.documentsProcessed)}
              icon={FileText}
              hint={trendLabel(current.stats.documentsTrend)}
            />
          </div>
        </div>

        <Tabs
          idPrefix="user"
          items={tabs}
          value={activeTab}
          onChange={setActiveTab}
        />

        <TabPanel idPrefix="user" id="overview" active={activeTab === 'overview'}>
          <div className="space-y-6">
            <SectionCard title="Professional bio">
              <p className="text-sm leading-relaxed text-text-secondary">
                {current.bio?.trim() ||
                  'No professional bio has been added for this user yet.'}
              </p>
            </SectionCard>
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title="Top skills">
                {current.skills.length === 0 ? (
                  <p className="text-sm text-text-secondary">No skills listed.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {current.skills.map((skill) => (
                      <Badge key={skill.id} variant="neutral">
                        {skill.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </SectionCard>
              <SectionCard title="Certifications">
                {current.certifications.length === 0 ? (
                  <p className="text-sm text-text-secondary">
                    No certifications listed.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {current.certifications.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-2 text-sm text-text-secondary"
                      >
                        <CheckCircle2 className="mt-0.5 size-4 text-success" />
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>
          </div>
        </TabPanel>

        <TabPanel idPrefix="user" id="cases" active={activeTab === 'cases'}>
          <SectionCard title="Assigned cases" bodyClassName="px-2 py-2">
            <DataTable
              caption="Assigned cases"
              columns={caseColumns}
              rows={current.assignedCases}
              rowKey={(row) => row.id}
              empty={
                <EmptyState
                  icon={Briefcase}
                  title="No assigned cases"
                  description="Cases assigned to this user will appear here."
                  className="border-0 py-10"
                />
              }
            />
          </SectionCard>
        </TabPanel>

        <TabPanel
          idPrefix="user"
          id="permissions"
          active={activeTab === 'permissions'}
        >
          <SectionCard title="Permissions">
            {current.permissions.length === 0 ? (
              <p className="text-sm text-text-secondary">
                No explicit permissions are attached to this profile yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {current.permissions.map((entry) => (
                  <li key={entry.module}>
                    <p className="text-sm font-semibold text-navy">
                      {permissionModuleLabels[entry.module]}
                    </p>
                    <p className="text-xs text-text-muted">
                      {entry.actions
                        .map((action) => permissionActionLabels[action])
                        .join(', ') || 'None'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabPanel>

        <TabPanel idPrefix="user" id="activity" active={activeTab === 'activity'}>
          <SectionCard title="Activity">
            {current.activities.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No activity yet"
                description="Security and workspace activity for this user will appear here."
                className="border-0 py-10"
              />
            ) : (
              <ul className="space-y-4">
                {current.activities.map((item) => (
                  <li key={item.id} className="border-b border-border-subtle pb-3 last:border-0">
                    <p className="text-sm font-semibold text-navy">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 text-sm text-text-secondary">
                        {item.description}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-text-muted">
                      {formatDateTime(item.occurredAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabPanel>

        <TabPanel idPrefix="user" id="security" active={activeTab === 'security'}>
          <InfoCard
            title="Security settings"
            items={[
              {
                label: 'MFA',
                value: current.security.mfaEnabled ? 'Enabled' : 'Disabled',
              },
              {
                label: 'Last password change',
                value: current.security.lastPasswordChangeAt
                  ? formatDateTime(current.security.lastPasswordChangeAt)
                  : 'Unknown',
              },
              {
                label: 'Active sessions',
                value: formatCount(current.security.sessionsCount),
              },
            ]}
          />
        </TabPanel>
      </div>

      <DeleteUserDialog
        open={deleteOpen}
        userName={current.fullName}
        deleting={isDeleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => deleteUser.mutate(current.id)}
      />
      <SuspendUserDialog
        open={suspendOpen}
        userName={current.fullName}
        suspending={isSuspending}
        onCancel={() => setSuspendOpen(false)}
        onConfirm={() => suspendUser.mutate(current.id)}
      />
      <ActivateUserDialog
        open={activateOpen}
        userName={current.fullName}
        activating={isActivating}
        onCancel={() => setActivateOpen(false)}
        onConfirm={() => activateUser.mutate(current.id)}
      />
      <ResetPasswordDialog
        open={resetOpen}
        userName={current.fullName}
        resetting={isResetting}
        onCancel={() => setResetOpen(false)}
        onConfirm={() =>
          resetPassword.mutate(current.id, {
            onSuccess: () => setResetOpen(false),
          })
        }
      />
    </>
  )
}
