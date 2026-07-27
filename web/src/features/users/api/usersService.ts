import { apiClient, getErrorMessage } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type {
  Invitation,
  InvitationListResponse,
  InviteUserPayload,
  Role,
  RoleListResponse,
  RolePayload,
  RolesSummary,
  UserListResponse,
  UserPayload,
  UserProfile,
  UsersSummary,
} from '../types'

export interface UserListParams {
  search?: string
  roleId?: string | 'ALL'
  department?: string | 'ALL'
  status?: string | 'ALL'
  page: number
  pageSize: number
}

export interface InvitationListParams {
  search?: string
  page: number
  pageSize: number
}

export interface RoleListParams {
  search?: string
  page: number
  pageSize: number
}

function emptyPagination(page: number, pageSize: number) {
  return { page, pageSize, total: 0, totalPages: 0, hasMore: false }
}

export const usersService = {
  async getUsers(params: UserListParams): Promise<UserListResponse> {
    try {
      const { data } = await apiClient.get<UserListResponse>(endpoints.users.root, {
        params: {
          search: params.search || undefined,
          role: params.roleId !== 'ALL' ? params.roleId : undefined,
          isActive: params.status === 'ACTIVE' ? 'true' : params.status === 'INACTIVE' ? 'false' : 'all',
          page: params.page,
          pageSize: params.pageSize,
        },
      })
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load users.'))
    }
  },

  async getUsersSummary(): Promise<UsersSummary | null> {
    return null
  },

  async getUser(id: string): Promise<UserProfile | null> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: UserProfile }>(
        endpoints.users.byId(id),
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load user.'))
    }
  },

  async createUser(payload: UserPayload): Promise<UserProfile | null> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: UserProfile }>(
        endpoints.users.invite,
        payload,
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create user.'))
    }
  },

  async updateUser(id: string, payload: Partial<UserPayload>): Promise<UserProfile | null> {
    try {
      const { data } = await apiClient.patch<{ success: boolean; data: UserProfile }>(
        endpoints.users.byId(id),
        payload,
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update user.'))
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(endpoints.users.byId(id))
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to remove user.'))
    }
  },

  async deleteUsers(ids: string[]): Promise<void> {
    for (const id of ids) {
      await usersService.deleteUser(id).catch(() => {})
    }
  },

  async inviteUser(payload: InviteUserPayload): Promise<Invitation | null> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: Invitation }>(
        endpoints.users.invite,
        payload,
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to invite user.'))
    }
  },

  async getInvitations(_params: InvitationListParams): Promise<InvitationListResponse> {
    // TODO: Invitations model not implemented
    return { items: [], pagination: emptyPagination(_params.page, _params.pageSize) }
  },

  async activateUser(id: string): Promise<UserProfile | null> {
    return usersService.updateUser(id, { isActive: true } as any)
  },

  async activateUsers(ids: string[]): Promise<void> {
    for (const id of ids) {
      await usersService.activateUser(id).catch(() => {})
    }
  },

  async suspendUser(id: string): Promise<UserProfile | null> {
    return usersService.updateUser(id, { isActive: false } as any)
  },

  async suspendUsers(ids: string[]): Promise<void> {
    for (const id of ids) {
      await usersService.suspendUser(id).catch(() => {})
    }
  },

  async resetPassword(_id: string): Promise<void> {
    // TODO: Password reset flow not implemented
  },

  async getRoles(_params: RoleListParams = { page: 1, pageSize: 50 }): Promise<RoleListResponse> {
    try {
      const { data } = await apiClient.get<RoleListResponse>(endpoints.users.roles)
      return data
    } catch {
      return { items: [], pagination: emptyPagination(_params.page, _params.pageSize) }
    }
  },

  async getRolesSummary(): Promise<RolesSummary | null> {
    return null
  },

  async getRole(id: string): Promise<Role | null> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: Role }>(
        endpoints.users.role(id),
      )
      return data.data ?? null
    } catch {
      return null
    }
  },

  async createRole(_payload: RolePayload): Promise<Role | null> {
    throw new Error('Custom roles are not supported. Use built-in WorkspaceRole values (OWNER, ADMIN, LAWYER, ASSISTANT, MEMBER).')
  },

  async updateRole(_id: string, _payload: Partial<RolePayload>): Promise<Role | null> {
    throw new Error('Custom roles are not supported.')
  },

  async duplicateRole(_id: string): Promise<Role | null> {
    throw new Error('Custom roles are not supported.')
  },

  async archiveRole(_id: string): Promise<Role | null> {
    throw new Error('Custom roles are not supported.')
  },

  async deleteRole(_id: string): Promise<void> {
    throw new Error('Custom roles are not supported.')
  },

  async updatePermissions(_roleId: string, _permissions: RolePayload['permissions']): Promise<Role | null> {
    throw new Error('Custom permissions are not supported.')
  },

  async importUsersCsv(_file: File): Promise<void> {
    // TODO: CSV import not implemented
  },
}
