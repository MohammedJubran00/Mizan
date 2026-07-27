import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

import type { InvoiceListParams } from '../api/billingService'
import { INVOICE_STATUSES, type InvoiceStatus } from '../types'

const DEFAULT_PAGE_SIZE = 10

function readStatus(value: string | null): InvoiceStatus | 'ALL' {
  return value && (INVOICE_STATUSES as readonly string[]).includes(value)
    ? (value as InvoiceStatus)
    : 'ALL'
}

/** Keeps invoice list search, status filter, and pagination in the URL. */
export function useBillingListParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlSearch = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(urlSearch)
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const lastPushedSearch = useRef(urlSearch)

  const status = readStatus(searchParams.get('status'))
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

  const params: InvoiceListParams = useMemo(
    () => ({
      search: urlSearch.trim() || undefined,
      status,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [urlSearch, status, page],
  )

  const hasActiveFilters = Boolean(urlSearch.trim()) || status !== 'ALL'

  const reset = useCallback(() => {
    setSearchInput('')
    lastPushedSearch.current = ''
    patch({ q: null, status: null })
  }, [patch])

  return {
    params,
    searchInput,
    setSearchInput,
    status,
    page,
    setStatus: (value: InvoiceStatus | 'ALL') => patch({ status: value }),
    setPage: (value: number) => patch({ page: String(value) }, false),
    hasActiveFilters,
    reset,
  }
}
