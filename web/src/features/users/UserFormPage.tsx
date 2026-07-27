import { AlertCircle, ArrowLeft, Upload, UserRound } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { Textarea } from '@/shared/components/Textarea'

import { UserProfileSkeleton } from './components/UsersSkeletons'
import { useUserForm } from './hooks/useUserForm'
import {
  useRoleList,
  useUserDetails,
  useUsersMutations,
} from './hooks/useUsersQueries'
import { departmentOptions, userStatusLabels } from './lib/labels'
import {
  emptyUserFormValues,
  toUserFormValues,
  toUserPayload,
  type UserFormValues,
} from './lib/userForm'
import { USER_STATUSES, type UserStatus } from './types'

interface UserFormPageProps {
  mode: 'create' | 'edit'
}

export function UserFormPage({ mode }: UserFormPageProps) {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user, state, refetch } = useUserDetails(
    mode === 'edit' ? userId : undefined,
  )

  if (mode === 'create') {
    return <UserFormEditor mode="create" initialValues={emptyUserFormValues} />
  }

  if (state === 'loading') {
    return (
      <>
        <TopBar title="Edit user" subtitle="Loading profile…" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <UserProfileSkeleton />
        </div>
      </>
    )
  }

  if (state === 'error') {
    return (
      <>
        <TopBar title="Edit user" subtitle="Update team member" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load user"
            description="We were unable to load this profile for editing."
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

  if (user === null) {
    return (
      <>
        <TopBar title="Edit user" subtitle="Update team member" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={UserRound}
            title="User not found"
            description="This user no longer exists or you do not have access."
            action={
              <Button
                variant="secondary"
                onClick={() => navigate('/users-permissions')}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
            }
          />
        </div>
      </>
    )
  }

  return (
    <UserFormEditor
      mode="edit"
      userId={user.id}
      initialValues={toUserFormValues(user)}
    />
  )
}

function UserFormEditor({
  mode,
  userId,
  initialValues,
}: {
  mode: 'create' | 'edit'
  userId?: string
  initialValues: UserFormValues
}) {
  const navigate = useNavigate()
  const form = useUserForm(initialValues, {
    requirePassword: mode === 'create',
  })
  const { items: roles } = useRoleList({ page: 1, pageSize: 100 })

  const { createUser, updateUser, isSaving } = useUsersMutations({
    onCreated: (user) => {
      if (user) navigate(`/users-permissions/${user.id}`, { replace: true })
      else navigate('/users-permissions', { replace: true })
    },
    onUpdated: (user) => {
      if (user) navigate(`/users-permissions/${user.id}`, { replace: true })
      else navigate('/users-permissions', { replace: true })
    },
  })

  function submit(sendInvite = false) {
    if (!form.validate()) return
    const payload = toUserPayload(form.values, { sendInvite })
    if (mode === 'edit' && userId) {
      updateUser.mutate({ id: userId, payload })
      return
    }
    createUser.mutate(payload)
  }

  const statusOptions = USER_STATUSES.map((value) => ({
    value,
    label: userStatusLabels[value],
  }))

  return (
    <>
      <TopBar
        title={mode === 'create' ? 'Add user' : 'Edit user'}
        subtitle="Create or update firm member access details."
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/users-permissions')}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Users', to: '/users-permissions' },
            { label: mode === 'create' ? 'Add user' : 'Edit user' },
          ]}
        />

        <Card className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              required
              value={form.values.firstName}
              onChange={(event) =>
                form.updateField('firstName', event.target.value)
              }
              onBlur={() => form.touchField('firstName')}
              error={form.fieldError('firstName')}
            />
            <Input
              label="Last name"
              required
              value={form.values.lastName}
              onChange={(event) =>
                form.updateField('lastName', event.target.value)
              }
              onBlur={() => form.touchField('lastName')}
              error={form.fieldError('lastName')}
            />
            <Input
              label="Email"
              type="email"
              required
              className="sm:col-span-2"
              value={form.values.email}
              onChange={(event) => form.updateField('email', event.target.value)}
              onBlur={() => form.touchField('email')}
              error={form.fieldError('email')}
            />
            <Input
              label="Phone"
              value={form.values.phone}
              onChange={(event) => form.updateField('phone', event.target.value)}
            />
            <Select
              label="Department"
              required
              options={departmentOptions}
              placeholder="Select department…"
              value={form.values.department}
              onChange={(event) =>
                form.updateField(
                  'department',
                  event.target.value as typeof form.values.department,
                )
              }
              onBlur={() => form.touchField('department')}
              error={form.fieldError('department')}
            />
            <Select
              label="Role"
              required
              options={roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
              placeholder={
                roles.length === 0 ? 'No roles yet' : 'Select a role…'
              }
              value={form.values.roleId}
              onChange={(event) => {
                const role = roles.find((item) => item.id === event.target.value)
                form.updateField('roleId', event.target.value)
                form.updateField('roleName', role?.name ?? '')
              }}
              onBlur={() => form.touchField('roleId')}
              error={form.fieldError('roleId')}
              disabled={roles.length === 0}
              hint={
                roles.length === 0
                  ? 'Create a role before assigning users.'
                  : undefined
              }
            />
            <Input
              label="Job title"
              value={form.values.jobTitle}
              onChange={(event) =>
                form.updateField('jobTitle', event.target.value)
              }
            />
            <Select
              label="Status"
              required
              options={statusOptions}
              value={form.values.status}
              onChange={(event) =>
                form.updateField('status', event.target.value as UserStatus)
              }
              error={form.fieldError('status')}
            />
            <Input
              label="Password"
              type="password"
              required={mode === 'create'}
              value={form.values.password}
              onChange={(event) =>
                form.updateField('password', event.target.value)
              }
              onBlur={() => form.touchField('password')}
              error={form.fieldError('password')}
              hint={
                mode === 'edit'
                  ? 'Leave blank to keep the current password.'
                  : undefined
              }
            />
            <Input
              label="Confirm password"
              type="password"
              required={mode === 'create'}
              value={form.values.confirmPassword}
              onChange={(event) =>
                form.updateField('confirmPassword', event.target.value)
              }
              onBlur={() => form.touchField('confirmPassword')}
              error={form.fieldError('confirmPassword')}
            />
            <div className="sm:col-span-2">
              <label className="flex w-full flex-col gap-1.5">
                <span className="text-sm font-medium text-text">
                  Profile image
                </span>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-text-secondary hover:bg-surface-muted">
                  <Upload className="size-4 text-blue" />
                  <span>
                    {form.values.avatarFileName ||
                      'Choose an image (upload is backend-ready)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      form.updateField('avatarFileName', file?.name ?? '')
                    }}
                  />
                </label>
              </label>
            </div>
            <Textarea
              label="Professional bio"
              className="sm:col-span-2"
              rows={4}
              value={form.values.bio}
              onChange={(event) => form.updateField('bio', event.target.value)}
            />
            <Input
              label="Practice area"
              value={form.values.practiceArea}
              onChange={(event) =>
                form.updateField('practiceArea', event.target.value)
              }
            />
            <Input
              label="Office location"
              value={form.values.officeLocation}
              onChange={(event) =>
                form.updateField('officeLocation', event.target.value)
              }
            />
            <Input
              label="Skills"
              className="sm:col-span-2"
              value={form.values.skills}
              onChange={(event) =>
                form.updateField('skills', event.target.value)
              }
              hint="Comma-separated skills"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border-subtle pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/users-permissions')}
            >
              Cancel
            </Button>
            {mode === 'create' ? (
              <Button
                variant="secondary"
                loading={isSaving}
                onClick={() => submit(true)}
              >
                Invite user
              </Button>
            ) : null}
            <Button loading={isSaving} onClick={() => submit(false)}>
              {mode === 'create' ? 'Create user' : 'Save changes'}
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}
