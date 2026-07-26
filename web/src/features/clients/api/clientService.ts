import type { Client, ClientDetails, ClientPayload, ClientStatus } from '../types'

/**
 * Placeholder data access layer for the clients module.
 *
 * The backend endpoints do not exist yet, so every method resolves with an
 * empty result. Swap the bodies for `apiClient` calls once the API lands —
 * the signatures are the contract the UI is built against.
 */
export interface ClientListParams {
  search?: string
  status?: ClientStatus | 'ALL'
}

export const clientService = {
  async getClients(_params: ClientListParams = {}): Promise<Client[]> {
    return []
  },

  async getClient(_id: string): Promise<ClientDetails | null> {
    return null
  },

  async createClient(_payload: ClientPayload): Promise<ClientDetails | null> {
    return null
  },

  async updateClient(
    _id: string,
    _payload: Partial<ClientPayload> & { status?: ClientStatus },
  ): Promise<ClientDetails | null> {
    return null
  },

  async deleteClient(_id: string): Promise<void> {
    return Promise.resolve()
  },
}
