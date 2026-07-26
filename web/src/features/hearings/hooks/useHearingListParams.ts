import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

import type { HearingListParams } from '../api/hearingService'
import { HEARING_SORT_OPTIONS, type HearingSortValue } from '../lib/labels'
import {
  HEARING_STATUSES,
  HEARING_TYPES,
  type HearingSortField,
  type HearingStatus,
  type HearingType,
  type SortDirection,
} from '../types'

const DEFAULT_SORT: HearingSortValue = 'scheduledAt:asc'
const DEFAULT_PAGE_SIZE = 10

function readEnum<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | 'ALL' {
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : 'ALL'
}

function readSort(value: string | null): HearingSortValue {
  const allowed = HEARING_SORT_OPTIONS.map((option) => option.value)
  return value && (allowed as readonly string[]).includes(value)
    ? (value as HearingSortValue)
    : DEFAULT_SORT
}

export function useHearingListParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlSearch = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(urlSearch)
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const lastPushedSearch = useRef(urlSearch)

  const status = readEnum<HearingStatus>(
    searchParams.get('status'),
    HEARING_STATUSES,
  )
  const type = readEnum<HearingType>(searchParams.get('type'), HEARING_TYPES)
  const sort = readSort(searchParams.get('sort'))
  const page = Math.max(Number(searchParams.get('page') ?? '1') || 1, 1)

  const patch = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)

          for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === '' || value === 'ALL') next.delete(key)
            else next.set(key, value)
          }

          if (resetPage) next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    if (debouncedSearch.trim() === urlSearch) return
    lastPushedSearch.current = debouncedSearch.trim()
    patch({ q: debouncedSearch.trim() || null })
  }, [debouncedSearch, urlSearch, patch])

  useEffect(() => {
    if (urlSearch === lastPushedSearch.current) return
    lastPushedSearch.current = urlSearch
    setSearchInput(urlSearch)
  }, [urlSearch])

  const [sortBy, sortDir] = sort.split(':') as [HearingSortField, SortDirection]

  const params: HearingListParams = useMemo(
    () => ({
      search: urlSearch.trim() || undefined,
      status,
      type,
      sortBy,
      sortDir,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [urlSearch, status, type, sortBy, sortDir, page],
  )

  const hasActiveFilters =
    Boolean(urlSearch.trim()) || status !== 'ALL' || type !== 'ALL'

  const reset = useCallback(() => {
    setSearchInput('')
    lastPushedSearch.current = ''
    patch({ q: null, status: null, type: null })
  }, [patch])

  return {
    params,
    searchInput,
    setSearchInput,
    status,
    type,
    sort,
    page,
    setStatus: (value: HearingStatus | 'ALL') => patch({ status: value }),
    setType: (value: HearingType | 'ALL') => patch({ type: value }),
    setSort: (value: string) => patch({ sort: value }),
    setPage: (value: number) => patch({ page: String(value) }, false),
    hasActiveFilters,
    reset,
  }
}
