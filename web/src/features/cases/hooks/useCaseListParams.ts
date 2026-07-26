import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

import type { CaseListParams } from '../api/caseService'
import { CASE_SORT_OPTIONS, type CaseSortValue } from '../lib/labels'
import {
  CASE_PRIORITIES,
  CASE_STATUSES,
  PRACTICE_AREAS,
  type CasePriority,
  type CaseSortField,
  type CaseStatus,
  type PracticeArea,
  type SortDirection,
} from '../types'

const DEFAULT_SORT: CaseSortValue = 'createdAt:desc'
const DEFAULT_PAGE_SIZE = 10

function readEnum<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | 'ALL' {
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : 'ALL'
}

function readSort(value: string | null): CaseSortValue {
  const allowed = CASE_SORT_OPTIONS.map((option) => option.value)
  return value && (allowed as readonly string[]).includes(value)
    ? (value as CaseSortValue)
    : DEFAULT_SORT
}

/**
 * Keeps search, filters, sorting, and pagination in the URL so list views are
 * shareable and survive a refresh or a round trip to a detail page.
 */
export function useCaseListParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlSearch = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(urlSearch)
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  /** Last term this hook wrote to the URL, so external changes can be detected. */
  const lastPushedSearch = useRef(urlSearch)

  const status = readEnum<CaseStatus>(searchParams.get('status'), CASE_STATUSES)
  const practiceArea = readEnum<PracticeArea>(
    searchParams.get('area'),
    PRACTICE_AREAS,
  )
  const priority = readEnum<CasePriority>(
    searchParams.get('priority'),
    CASE_PRIORITIES,
  )
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

  // Push the debounced search term into the URL without a history entry per key.
  useEffect(() => {
    if (debouncedSearch.trim() === urlSearch) return

    lastPushedSearch.current = debouncedSearch.trim()
    patch({ q: debouncedSearch.trim() || null })
  }, [debouncedSearch, urlSearch, patch])

  // Adopt search terms that arrive from elsewhere, e.g. browser back/forward.
  useEffect(() => {
    if (urlSearch === lastPushedSearch.current) return

    lastPushedSearch.current = urlSearch
    setSearchInput(urlSearch)
  }, [urlSearch])

  const [sortBy, sortDir] = sort.split(':') as [CaseSortField, SortDirection]

  const params: CaseListParams = useMemo(
    () => ({
      search: urlSearch.trim() || undefined,
      status,
      practiceArea,
      priority,
      sortBy,
      sortDir,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [urlSearch, status, practiceArea, priority, sortBy, sortDir, page],
  )

  const hasActiveFilters =
    Boolean(urlSearch.trim()) ||
    status !== 'ALL' ||
    practiceArea !== 'ALL' ||
    priority !== 'ALL'

  const reset = useCallback(() => {
    setSearchInput('')
    lastPushedSearch.current = ''
    patch({ q: null, status: null, area: null, priority: null })
  }, [patch])

  return {
    params,
    searchInput,
    setSearchInput,
    status,
    practiceArea,
    priority,
    sort,
    page,
    setStatus: (value: CaseStatus | 'ALL') => patch({ status: value }),
    setPracticeArea: (value: PracticeArea | 'ALL') => patch({ area: value }),
    setPriority: (value: CasePriority | 'ALL') => patch({ priority: value }),
    setSort: (value: string) => patch({ sort: value }),
    setPage: (value: number) => patch({ page: String(value) }, false),
    hasActiveFilters,
    reset,
  }
}
