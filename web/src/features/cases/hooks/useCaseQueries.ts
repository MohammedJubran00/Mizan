import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/stores/toastStore'

import {
  caseService,
  type CaseListParams,
  type HearingListParams,
} from '../api/caseService'
import type {
  CaseDetails,
  CaseListItem,
  CasePayload,
  CaseStatus,
  Hearing,
  HearingPayload,
} from '../types'

export const caseKeys = {
  all: ['cases'] as const,
  list: (params: CaseListParams) => ['cases', 'list', params] as const,
  stats: () => ['cases', 'stats'] as const,
  detail: (id: string) => ['cases', 'detail', id] as const,
  hearings: (caseId: string, params: HearingListParams) =>
    ['cases', 'hearings', caseId, params] as const,
}

export type CaseResourceState = 'loading' | 'error' | 'empty' | 'ready'

const NO_CASES: CaseListItem[] = []
const NO_HEARINGS: Hearing[] = []

function describeError(error: unknown) {
  return error instanceof Error ? error.message : 'Please try again.'
}

export function useCaseList(params: CaseListParams) {
  const query = useQuery({
    queryKey: caseKeys.list(params),
    queryFn: () => caseService.getCases(params),
  })

  const items = query.data?.items ?? NO_CASES

  const state: CaseResourceState = query.isPending
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
    /** True while a background refetch runs, e.g. after a search keystroke. */
    isSearching: query.isFetching && !query.isPending,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useCaseStats() {
  const query = useQuery({
    queryKey: caseKeys.stats(),
    queryFn: () => caseService.getCaseStats(),
  })

  return {
    stats: query.data ?? null,
    isLoading: query.isPending,
    isError: query.isError,
  }
}

export function useCaseDetails(id: string | undefined) {
  const query = useQuery({
    queryKey: caseKeys.detail(id ?? 'unknown'),
    queryFn: () => caseService.getCase(id as string),
    enabled: Boolean(id),
  })

  const caseDetails: CaseDetails | null = query.data ?? null

  const state: CaseResourceState = !id
    ? 'empty'
    : query.isPending
      ? 'loading'
      : query.isError
        ? 'error'
        : caseDetails === null
          ? 'empty'
          : 'ready'

  return {
    caseDetails,
    state,
    error: query.error,
    refetch: query.refetch,
  }
}

interface CaseMutationCallbacks {
  onCreated?: (created: CaseDetails | null) => void
  onUpdated?: (updated: CaseDetails | null) => void
  onDeleted?: () => void
  onStatusChanged?: (updated: CaseDetails | null) => void
}

export function useCaseMutations({
  onCreated,
  onUpdated,
  onDeleted,
  onStatusChanged,
}: CaseMutationCallbacks = {}) {
  const queryClient = useQueryClient()

  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: caseKeys.all })

  const createCase = useMutation({
    mutationFn: (payload: CasePayload) => caseService.createCase(payload),
    onSuccess: async (created) => {
      await invalidateAll()
      toast.success('Case created', 'The matter has been added to your workspace.')
      onCreated?.(created)
    },
    onError: (error) => toast.error('Could not create case', describeError(error)),
  })

  const updateCase = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CasePayload> }) =>
      caseService.updateCase(id, payload),
    onSuccess: async (updated, variables) => {
      await queryClient.invalidateQueries({
        queryKey: caseKeys.detail(variables.id),
      })
      await invalidateAll()
      toast.success('Case updated', 'Your changes have been saved.')
      onUpdated?.(updated)
    },
    onError: (error) => toast.error('Could not update case', describeError(error)),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CaseStatus }) =>
      caseService.updateStatus(id, status),
    onSuccess: async (updated, variables) => {
      await queryClient.invalidateQueries({
        queryKey: caseKeys.detail(variables.id),
      })
      await invalidateAll()
      toast.success('Status updated', 'The case lifecycle state has been changed.')
      onStatusChanged?.(updated)
    },
    onError: (error) => toast.error('Could not update status', describeError(error)),
  })

  const deleteCase = useMutation({
    mutationFn: (id: string) => caseService.deleteCase(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: caseKeys.detail(id) })
      await invalidateAll()
      toast.success('Case deleted', 'The matter and its records were removed.')
      onDeleted?.()
    },
    onError: (error) => toast.error('Could not delete case', describeError(error)),
  })

  const deleteCases = useMutation({
    mutationFn: (ids: string[]) => caseService.deleteCases(ids),
    onSuccess: async (_result, ids) => {
      for (const id of ids) {
        queryClient.removeQueries({ queryKey: caseKeys.detail(id) })
      }
      await invalidateAll()
      toast.success(
        `${ids.length} ${ids.length === 1 ? 'case' : 'cases'} deleted`,
        'The selected matters were removed.',
      )
      onDeleted?.()
    },
    onError: (error) => toast.error('Could not delete cases', describeError(error)),
  })

  return {
    createCase,
    updateCase,
    updateStatus,
    deleteCase,
    deleteCases,
    isCreating: createCase.isPending,
    isUpdating: updateCase.isPending || updateStatus.isPending,
    isDeleting: deleteCase.isPending || deleteCases.isPending,
  }
}

export function useHearingList(
  caseId: string | undefined,
  params: HearingListParams,
) {
  const query = useQuery({
    queryKey: caseKeys.hearings(caseId ?? 'unknown', params),
    queryFn: () => caseService.getHearings(caseId as string, params),
    enabled: Boolean(caseId),
  })

  const items = query.data?.items ?? NO_HEARINGS

  const state: CaseResourceState = !caseId
    ? 'empty'
    : query.isPending
      ? 'loading'
      : query.isError
        ? 'error'
        : items.length === 0
          ? 'empty'
          : 'ready'

  return {
    hearings: items,
    pagination: query.data?.pagination,
    state,
    refetch: query.refetch,
  }
}

export function useHearingMutations(
  caseId: string | undefined,
  { onCreated }: { onCreated?: (hearing: Hearing | null) => void } = {},
) {
  const queryClient = useQueryClient()

  const createHearing = useMutation({
    mutationFn: (payload: HearingPayload) =>
      caseService.createHearing(caseId as string, payload),
    onSuccess: async (hearing) => {
      await queryClient.invalidateQueries({ queryKey: caseKeys.all })
      toast.success('Hearing scheduled', 'The hearing was added to the case.')
      onCreated?.(hearing)
    },
    onError: (error) =>
      toast.error('Could not schedule hearing', describeError(error)),
  })

  return { createHearing, isScheduling: createHearing.isPending }
}
