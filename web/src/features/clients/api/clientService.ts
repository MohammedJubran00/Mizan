import { apiClient, getErrorMessage } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { Client, ClientDetails, ClientPayload, ClientStatus } from '../types'

export interface ClientListParams {
  search?: string
  status?: ClientStatus | 'ALL'
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: string
}

export interface ClientListResponse {
  items: Client[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export const clientService = {
  async getClients(params: ClientListParams = {}): Promise<ClientListResponse> {
    try {
      const { data } = await apiClient.get<{
        success: boolean
        items: Client[]
        pagination: ClientListResponse['pagination']
      }>(endpoints.clients.root, {
        params: {
          search: params.search || undefined,
          status: params.status || 'ALL',
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 50,
          sortBy: params.sortBy ?? 'createdAt',
          sortDir: params.sortDir ?? 'desc',
        },
      })
      return {
        items: data.items ?? [],
        pagination: data.pagination,
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load clients.'))
    }
  },

  async getClient(id: string): Promise<ClientDetails | null> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: ClientDetails }>(
        endpoints.clients.byId(id),
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load client.'))
    }
  },

  async createClient(payload: ClientPayload): Promise<ClientDetails> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: ClientDetails }>(
        endpoints.clients.root,
        payload,
      )
      return data.data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create client.'))
    }
  },

  async updateClient(
    id: string,
    payload: Partial<ClientPayload> & { status?: ClientStatus },
  ): Promise<ClientDetails> {
    try {
      const { data } = await apiClient.patch<{ success: boolean; data: ClientDetails }>(
        endpoints.clients.byId(id),
        payload,
      )
      return data.data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update client.'))
    }
  },

  async deleteClient(id: string): Promise<void> {
    try {
      await apiClient.delete(endpoints.clients.byId(id))
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to delete client.'))
    }
  },
}
