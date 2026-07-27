import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

import type { ReportListParams } from '../api/reportsService'
import { REPORT_CATEGORIES, type ReportCategory } from '../types'

const DEFAULT_PAGE_SIZE = 10

function readCategory(value: string | null): ReportCategory | 'ALL' {
  return value && (REPORT_CATEGORIES as readonly string[]).includes(value)
    ? (value as ReportCategory)
    : 'ALL'
}

function readSort(
  value: string | null,
): Pick<ReportListParams, 'sortBy' | 'sortDir'> {
  const allowed = ['name:asc', 'name:desc', 'createdAt:asc', 'createdAt:desc', 'lastRunAt:asc', 'lastRunAt:desc']
  const resolved =
    value && allowed.includes(value) ? value : 'createdAt:desc'
  const [sortBy, sortDir] = resolved.split(':') as [
    ReportListParams['sortBy'],
    ReportListParams['sortDir'],
  ]
  return { sortBy, sortDir }
}

export function useReportListParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlSearch = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(urlSearch)
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const lastPushedSearch = useRef(urlSearch)

  const category = readCategory(searchParams.get('category'))
  const { sortBy, sortDir } = readSort(searchParams.get('sort'))
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

  const params: ReportListParams = useMemo(
    () => ({
      search: urlSearch.trim() || undefined,
      category,
      sortBy,
      sortDir,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [urlSearch, category, sortBy, sortDir, page],
  )

  const hasActiveFilters = Boolean(urlSearch.trim()) || category !== 'ALL'

  const reset = useCallback(() => {
    setSearchInput('')
    lastPushedSearch.current = ''
    patch({ q: null, category: null })
  }, [patch])

  return {
    params,
    searchInput,
    setSearchInput,
    category,
    sort: `${sortBy}:${sortDir}`,
    page,
    setCategory: (value: ReportCategory | 'ALL') =>
      patch({ category: value }),
    setSort: (value: string) => patch({ sort: value }),
    setPage: (value: number) => patch({ page: String(value) }, false),
    hasActiveFilters,
    reset,
  }
}
