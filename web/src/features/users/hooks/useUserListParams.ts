import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

import type { UserListParams } from '../api/usersService'
import { DEPARTMENTS, USER_STATUSES } from '../types'

const DEFAULT_PAGE_SIZE = 10

function readOrAll<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | 'ALL' {
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : 'ALL'
}

export function useUserListParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlSearch = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(urlSearch)
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const lastPushedSearch = useRef(urlSearch)

  const roleId = searchParams.get('role') ?? 'ALL'
  const department = readOrAll(searchParams.get('department'), DEPARTMENTS)
  const status = readOrAll(searchParams.get('status'), USER_STATUSES)
  const page = Math.max(Number(searchParams.get('page') ?? '1') || 1, 1)
  const pageSize = Math.max(
    Number(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE)) ||
      DEFAULT_PAGE_SIZE,
    1,
  )

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

  const params: UserListParams = useMemo(
    () => ({
      search: urlSearch.trim() || undefined,
      roleId,
      department,
      status,
      page,
      pageSize,
    }),
    [urlSearch, roleId, department, status, page, pageSize],
  )

  const hasActiveFilters =
    Boolean(urlSearch.trim()) ||
    roleId !== 'ALL' ||
    department !== 'ALL' ||
    status !== 'ALL'

  const reset = useCallback(() => {
    setSearchInput('')
    lastPushedSearch.current = ''
    patch({ q: null, role: null, department: null, status: null })
  }, [patch])

  return {
    params,
    searchInput,
    setSearchInput,
    roleId,
    department,
    status,
    page,
    pageSize,
    setRoleId: (value: string) => patch({ role: value }),
    setDepartment: (value: string) => patch({ department: value }),
    setStatus: (value: string) => patch({ status: value }),
    setPage: (value: number) => patch({ page: String(value) }, false),
    setPageSize: (value: number) =>
      patch({ pageSize: String(value), page: '1' }, false),
    hasActiveFilters,
    reset,
  }
}
