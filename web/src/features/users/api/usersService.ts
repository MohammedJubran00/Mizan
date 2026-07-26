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

/**
 * Placeholder data access layer for users, roles, and permissions.
 * Swap bodies for `apiClient` + `endpoints.users` when the API lands.
 */
export const usersService = {
  async getUsers(params: UserListParams): Promise<UserListResponse> {
    return {
      items: [],
      pagination: emptyPagination(params.page, params.pageSize),
    }
  },

  async getUsersSummary(): Promise<UsersSummary | null> {
    return null
  },

  async getUser(_id: string): Promise<UserProfile | null> {
    return null
  },

  async createUser(_payload: UserPayload): Promise<UserProfile | null> {
    return null
  },

  async updateUser(
    _id: string,
    _payload: Partial<UserPayload>,
  ): Promise<UserProfile | null> {
    return null
  },

  async deleteUser(_id: string): Promise<void> {
    return Promise.resolve()
  },

  async deleteUsers(_ids: string[]): Promise<void> {
    return Promise.resolve()
  },

  async inviteUser(_payload: InviteUserPayload): Promise<Invitation | null> {
    return null
  },

  async getInvitations(
    params: InvitationListParams,
  ): Promise<InvitationListResponse> {
    return {
      items: [],
      pagination: emptyPagination(params.page, params.pageSize),
    }
  },

  async activateUser(_id: string): Promise<UserProfile | null> {
    return null
  },

  async activateUsers(_ids: string[]): Promise<void> {
    return Promise.resolve()
  },

  async suspendUser(_id: string): Promise<UserProfile | null> {
    return null
  },

  async suspendUsers(_ids: string[]): Promise<void> {
    return Promise.resolve()
  },

  async resetPassword(_id: string): Promise<void> {
    return Promise.resolve()
  },

  async getRoles(params: RoleListParams = { page: 1, pageSize: 50 }): Promise<RoleListResponse> {
    return {
      items: [],
      pagination: emptyPagination(params.page, params.pageSize),
    }
  },

  async getRolesSummary(): Promise<RolesSummary | null> {
    return null
  },

  async getRole(_id: string): Promise<Role | null> {
    return null
  },

  async createRole(_payload: RolePayload): Promise<Role | null> {
    return null
  },

  async updateRole(
    _id: string,
    _payload: Partial<RolePayload>,
  ): Promise<Role | null> {
    return null
  },

  async duplicateRole(_id: string): Promise<Role | null> {
    return null
  },

  async archiveRole(_id: string): Promise<Role | null> {
    return null
  },

  async deleteRole(_id: string): Promise<void> {
    return Promise.resolve()
  },

  async updatePermissions(
    _roleId: string,
    _permissions: RolePayload['permissions'],
  ): Promise<Role | null> {
    return null
  },

  async importUsersCsv(_file: File): Promise<void> {
    return Promise.resolve()
  },
}
