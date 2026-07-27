import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/stores/toastStore'

import {
  usersService,
  type InvitationListParams,
  type RoleListParams,
  type UserListParams,
} from '../api/usersService'
import type {
  InviteUserPayload,
  RolePayload,
  UserPayload,
  UserProfile,
} from '../types'

export const usersKeys = {
  all: ['users'] as const,
  list: (params: UserListParams) => ['users', 'list', params] as const,
  summary: () => ['users', 'summary'] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
  invitations: (params: InvitationListParams) =>
    ['users', 'invitations', params] as const,
  roles: (params: RoleListParams) => ['users', 'roles', params] as const,
  rolesSummary: () => ['users', 'roles-summary'] as const,
  roleDetail: (id: string) => ['users', 'role', id] as const,
}

export type UsersResourceState = 'loading' | 'error' | 'empty' | 'ready'

function describeError(error: unknown) {
  return error instanceof Error ? error.message : 'Please try again.'
}

export function useUserList(params: UserListParams) {
  const query = useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersService.getUsers(params),
  })

  const items = query.data?.items ?? []
  const state: UsersResourceState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : items.length === 0
        ? 'empty'
        : 'ready'

  return {
    items,
    pagination: query.data?.pagination,
    state,
    isSearching: query.isFetching && !query.isPending,
    refetch: query.refetch,
  }
}

export function useUsersSummary() {
  const query = useQuery({
    queryKey: usersKeys.summary(),
    queryFn: () => usersService.getUsersSummary(),
  })

  return {
    summary: query.data ?? null,
    isLoading: query.isPending,
  }
}

export function useUserDetails(id: string | undefined) {
  const query = useQuery({
    queryKey: usersKeys.detail(id ?? 'unknown'),
    queryFn: () => usersService.getUser(id as string),
    enabled: Boolean(id),
  })

  const user: UserProfile | null = query.data ?? null
  const state: UsersResourceState = !id
    ? 'empty'
    : query.isPending
      ? 'loading'
      : query.isError
        ? 'error'
        : user === null
          ? 'empty'
          : 'ready'

  return { user, state, refetch: query.refetch }
}

export function useInvitations(params: InvitationListParams) {
  const query = useQuery({
    queryKey: usersKeys.invitations(params),
    queryFn: () => usersService.getInvitations(params),
  })

  const items = query.data?.items ?? []
  const state: UsersResourceState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : items.length === 0
        ? 'empty'
        : 'ready'

  return {
    items,
    pagination: query.data?.pagination,
    state,
    refetch: query.refetch,
  }
}

export function useRoleList(params: RoleListParams = { page: 1, pageSize: 50 }) {
  const query = useQuery({
    queryKey: usersKeys.roles(params),
    queryFn: () => usersService.getRoles(params),
  })

  const items = query.data?.items ?? []
  const state: UsersResourceState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : items.length === 0
        ? 'empty'
        : 'ready'

  return {
    items,
    pagination: query.data?.pagination,
    state,
    isSearching: query.isFetching && !query.isPending,
    refetch: query.refetch,
  }
}

export function useRolesSummary() {
  const query = useQuery({
    queryKey: usersKeys.rolesSummary(),
    queryFn: () => usersService.getRolesSummary(),
  })

  return {
    summary: query.data ?? null,
    isLoading: query.isPending,
  }
}

interface MutationCallbacks {
  onCreated?: (user: UserProfile | null) => void
  onUpdated?: (user: UserProfile | null) => void
  onDeleted?: () => void
  onInvited?: () => void
  onRoleSaved?: () => void
}

export function useUsersMutations({
  onCreated,
  onUpdated,
  onDeleted,
  onInvited,
  onRoleSaved,
}: MutationCallbacks = {}) {
  const queryClient = useQueryClient()
  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: usersKeys.all })

  const createUser = useMutation({
    mutationFn: (payload: UserPayload) => usersService.createUser(payload),
    onSuccess: async (user, payload) => {
      await invalidateAll()
      toast.success(
        payload.sendInvite ? 'Invitation created' : 'User created',
        'The user record has been saved.',
      )
      onCreated?.(user)
    },
    onError: (error) =>
      toast.error('Could not create user', describeError(error)),
  })

  const updateUser = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<UserPayload>
    }) => usersService.updateUser(id, payload),
    onSuccess: async (user, variables) => {
      await queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.id),
      })
      await invalidateAll()
      toast.success('User updated', 'Your changes have been saved.')
      onUpdated?.(user)
    },
    onError: (error) =>
      toast.error('Could not update user', describeError(error)),
  })

  const deleteUser = useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: async (_r, id) => {
      queryClient.removeQueries({ queryKey: usersKeys.detail(id) })
      await invalidateAll()
      toast.success('User deleted', 'The user was permanently removed.')
      onDeleted?.()
    },
    onError: (error) =>
      toast.error('Could not delete user', describeError(error)),
  })

  const deleteUsers = useMutation({
    mutationFn: (ids: string[]) => usersService.deleteUsers(ids),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Users deleted', 'Selected users were removed.')
      onDeleted?.()
    },
    onError: (error) =>
      toast.error('Could not delete users', describeError(error)),
  })

  const inviteUser = useMutation({
    mutationFn: (payload: InviteUserPayload) => usersService.inviteUser(payload),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Invitation sent', 'The invite was queued for delivery.')
      onInvited?.()
    },
    onError: (error) =>
      toast.error('Could not send invitation', describeError(error)),
  })

  const activateUser = useMutation({
    mutationFn: (id: string) => usersService.activateUser(id),
    onSuccess: async (user, id) => {
      await queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) })
      await invalidateAll()
      toast.success('User activated', 'Access has been restored.')
      onUpdated?.(user)
    },
    onError: (error) =>
      toast.error('Could not activate user', describeError(error)),
  })

  const activateUsers = useMutation({
    mutationFn: (ids: string[]) => usersService.activateUsers(ids),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Users activated', 'Selected accounts were enabled.')
      onUpdated?.(null)
    },
    onError: (error) =>
      toast.error('Could not activate users', describeError(error)),
  })

  const suspendUser = useMutation({
    mutationFn: (id: string) => usersService.suspendUser(id),
    onSuccess: async (user, id) => {
      await queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) })
      await invalidateAll()
      toast.success('User suspended', 'Access has been temporarily disabled.')
      onUpdated?.(user)
    },
    onError: (error) =>
      toast.error('Could not suspend user', describeError(error)),
  })

  const suspendUsers = useMutation({
    mutationFn: (ids: string[]) => usersService.suspendUsers(ids),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Users suspended', 'Selected accounts were disabled.')
      onUpdated?.(null)
    },
    onError: (error) =>
      toast.error('Could not suspend users', describeError(error)),
  })

  const resetPassword = useMutation({
    mutationFn: (id: string) => usersService.resetPassword(id),
    onSuccess: async () => {
      toast.success(
        'Reset email queued',
        'A password reset message will be sent when email is connected.',
      )
    },
    onError: (error) =>
      toast.error('Could not reset password', describeError(error)),
  })

  const createRole = useMutation({
    mutationFn: (payload: RolePayload) => usersService.createRole(payload),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Role created', 'The role is ready to assign.')
      onRoleSaved?.()
    },
    onError: (error) =>
      toast.error('Could not create role', describeError(error)),
  })

  const updateRole = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<RolePayload>
    }) => usersService.updateRole(id, payload),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Role updated', 'Your changes have been saved.')
      onRoleSaved?.()
    },
    onError: (error) =>
      toast.error('Could not update role', describeError(error)),
  })

  const duplicateRole = useMutation({
    mutationFn: (id: string) => usersService.duplicateRole(id),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Role duplicated', 'A copy of the role was created.')
      onRoleSaved?.()
    },
    onError: (error) =>
      toast.error('Could not duplicate role', describeError(error)),
  })

  const archiveRole = useMutation({
    mutationFn: (id: string) => usersService.archiveRole(id),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Role archived', 'The role is no longer assignable.')
      onRoleSaved?.()
    },
    onError: (error) =>
      toast.error('Could not archive role', describeError(error)),
  })

  const deleteRole = useMutation({
    mutationFn: (id: string) => usersService.deleteRole(id),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Role deleted', 'The role was permanently removed.')
      onRoleSaved?.()
    },
    onError: (error) =>
      toast.error('Could not delete role', describeError(error)),
  })

  const updatePermissions = useMutation({
    mutationFn: ({
      roleId,
      permissions,
    }: {
      roleId: string
      permissions: RolePayload['permissions']
    }) => usersService.updatePermissions(roleId, permissions),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Permissions saved', 'Role capabilities were updated.')
      onRoleSaved?.()
    },
    onError: (error) =>
      toast.error('Could not save permissions', describeError(error)),
  })

  const importUsersCsv = useMutation({
    mutationFn: (file: File) => usersService.importUsersCsv(file),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Import queued', 'CSV import will run when the API is connected.')
    },
    onError: (error) =>
      toast.error('Could not import users', describeError(error)),
  })

  return {
    createUser,
    updateUser,
    deleteUser,
    deleteUsers,
    inviteUser,
    activateUser,
    activateUsers,
    suspendUser,
    suspendUsers,
    resetPassword,
    createRole,
    updateRole,
    duplicateRole,
    archiveRole,
    deleteRole,
    updatePermissions,
    importUsersCsv,
    isSaving: createUser.isPending || updateUser.isPending,
    isDeleting: deleteUser.isPending || deleteUsers.isPending,
    isInviting: inviteUser.isPending,
    isSuspending: suspendUser.isPending || suspendUsers.isPending,
    isActivating: activateUser.isPending || activateUsers.isPending,
    isResetting: resetPassword.isPending,
    isSavingRole:
      createRole.isPending ||
      updateRole.isPending ||
      updatePermissions.isPending,
  }
}
