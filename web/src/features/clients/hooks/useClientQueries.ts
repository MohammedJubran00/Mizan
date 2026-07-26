import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/stores/toastStore'

import { clientService, type ClientListParams } from '../api/clientService'
import type { Client, ClientDetails, ClientPayload, ClientStatus } from '../types'

export const clientKeys = {
  all: ['clients'] as const,
  list: (params: ClientListParams) => ['clients', 'list', params] as const,
  detail: (id: string) => ['clients', 'detail', id] as const,
}

/** Explicit view state so components never re-derive it ad hoc. */
export type ClientResourceState = 'loading' | 'error' | 'empty' | 'ready'

const NO_CLIENTS: Client[] = []

export function useClientList(params: ClientListParams = {}) {
  const query = useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientService.getClients(params),
  })

  const clients = query.data ?? NO_CLIENTS

  const state: ClientResourceState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : clients.length === 0
        ? 'empty'
        : 'ready'

  return {
    clients,
    state,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  }
}

export function useClientDetails(id: string | undefined) {
  const query = useQuery({
    queryKey: clientKeys.detail(id ?? 'unknown'),
    queryFn: () => clientService.getClient(id as string),
    enabled: Boolean(id),
  })

  const client: ClientDetails | null = query.data ?? null

  const state: ClientResourceState = !id
    ? 'empty'
    : query.isPending
      ? 'loading'
      : query.isError
        ? 'error'
        : client === null
          ? 'empty'
          : 'ready'

  return {
    client,
    state,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  }
}

interface MutationCallbacks {
  onCreated?: (client: ClientDetails | null) => void
  onUpdated?: (client: ClientDetails | null) => void
  onDeleted?: () => void
}

function describeError(error: unknown) {
  return error instanceof Error ? error.message : 'Please try again.'
}

export function useClientMutations({
  onCreated,
  onUpdated,
  onDeleted,
}: MutationCallbacks = {}) {
  const queryClient = useQueryClient()

  const invalidateLists = () =>
    queryClient.invalidateQueries({ queryKey: clientKeys.all })

  const createClient = useMutation({
    mutationFn: (payload: ClientPayload) => clientService.createClient(payload),
    onSuccess: async (client) => {
      await invalidateLists()
      toast.success('Client created', 'The client profile has been saved.')
      onCreated?.(client)
    },
    onError: (error) =>
      toast.error('Could not create client', describeError(error)),
  })

  const updateClient = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<ClientPayload> & { status?: ClientStatus }
    }) => clientService.updateClient(id, payload),
    onSuccess: async (client, variables) => {
      await queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.id),
      })
      await invalidateLists()
      toast.success('Client updated', 'Your changes have been saved.')
      onUpdated?.(client)
    },
    onError: (error) =>
      toast.error('Could not update client', describeError(error)),
  })

  const deleteClient = useMutation({
    mutationFn: (id: string) => clientService.deleteClient(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: clientKeys.detail(id) })
      await invalidateLists()
      toast.success('Client deleted', 'The client and its data were removed.')
      onDeleted?.()
    },
    onError: (error) =>
      toast.error('Could not delete client', describeError(error)),
  })

  return {
    createClient,
    updateClient,
    deleteClient,
    isSaving: createClient.isPending || updateClient.isPending,
    isDeleting: deleteClient.isPending,
  }
}
