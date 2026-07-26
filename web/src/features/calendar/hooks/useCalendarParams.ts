import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

import type { EventListParams } from '../api/eventService'
import {
  rangeFor,
  shiftCursor,
  startOfDay,
  toDateInputValue,
} from '../lib/calendarDates'
import {
  EVENT_CATEGORIES,
  EVENT_PRIORITIES,
  EVENT_STATUSES,
  type CalendarViewMode,
  type EventCategory,
  type EventPriority,
  type EventStatus,
} from '../types'

const VIEWS: readonly CalendarViewMode[] = ['month', 'week', 'day', 'agenda']
const AGENDA_PAGE_SIZE = 20
const CALENDAR_PAGE_SIZE = 200

function readEnum<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | 'ALL' {
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : 'ALL'
}

function readView(value: string | null): CalendarViewMode {
  return value && (VIEWS as readonly string[]).includes(value)
    ? (value as CalendarViewMode)
    : 'month'
}

function readCursor(value: string | null) {
  if (!value) return startOfDay(new Date())
  const parsed = new Date(`${value}T00:00`)
  return Number.isNaN(parsed.getTime()) ? startOfDay(new Date()) : parsed
}

function readList(value: string | null) {
  return value ? value.split(',').filter(Boolean) : []
}

/** Narrows the visible calendar window with the optional date-range filter. */
function intersectRange(
  view: { from: Date; to: Date },
  filterFrom: string,
  filterTo: string,
) {
  let from = view.from
  let to = view.to

  if (filterFrom) {
    const parsed = new Date(`${filterFrom}T00:00`)
    if (!Number.isNaN(parsed.getTime()) && parsed > from) from = parsed
  }

  if (filterTo) {
    const parsed = new Date(`${filterTo}T23:59:59`)
    if (!Number.isNaN(parsed.getTime()) && parsed < to) to = parsed
  }

  return { from, to }
}

export function useCalendarParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlSearch = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(urlSearch)
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const lastPushedSearch = useRef(urlSearch)

  const view = readView(searchParams.get('view'))
  const cursorParam = searchParams.get('date') ?? ''
  const cursor = useMemo(() => readCursor(cursorParam), [cursorParam])
  const category = readEnum<EventCategory>(
    searchParams.get('category'),
    EVENT_CATEGORIES,
  )
  const priority = readEnum<EventPriority>(
    searchParams.get('priority'),
    EVENT_PRIORITIES,
  )
  const status = readEnum<EventStatus>(searchParams.get('status'), EVENT_STATUSES)
  const lawyerId = searchParams.get('lawyer') ?? ''
  const clientId = searchParams.get('client') ?? ''
  const caseId = searchParams.get('case') ?? ''
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''
  const page = Math.max(Number(searchParams.get('page') ?? '1') || 1, 1)

  const hiddenCategories = useMemo(
    () =>
      readList(searchParams.get('hidden')).filter((value): value is EventCategory =>
        (EVENT_CATEGORIES as readonly string[]).includes(value),
      ),
    [searchParams],
  )
  const hiddenCalendars = useMemo(
    () => readList(searchParams.get('cal')),
    [searchParams],
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

  const range = useMemo(
    () => intersectRange(rangeFor(cursor, view), from, to),
    [cursor, view, from, to],
  )

  const params: EventListParams = useMemo(
    () => ({
      search: urlSearch.trim() || undefined,
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      category,
      priority,
      status,
      lawyerId: lawyerId || undefined,
      clientId: clientId || undefined,
      caseId: caseId || undefined,
      hiddenCategories,
      hiddenCalendarIds: hiddenCalendars,
      sortBy: 'startAt',
      sortDir: 'asc',
      page: view === 'agenda' ? page : 1,
      pageSize: view === 'agenda' ? AGENDA_PAGE_SIZE : CALENDAR_PAGE_SIZE,
    }),
    [
      urlSearch,
      range,
      category,
      priority,
      status,
      lawyerId,
      clientId,
      caseId,
      hiddenCategories,
      hiddenCalendars,
      view,
      page,
    ],
  )

  const hasActiveFilters =
    Boolean(urlSearch.trim()) ||
    category !== 'ALL' ||
    priority !== 'ALL' ||
    status !== 'ALL' ||
    Boolean(lawyerId) ||
    Boolean(clientId) ||
    Boolean(caseId) ||
    Boolean(from) ||
    Boolean(to)

  const goToDate = useCallback(
    (date: Date) => patch({ date: toDateInputValue(date) }),
    [patch],
  )

  const toggleCategory = useCallback(
    (value: EventCategory) => {
      const next = hiddenCategories.includes(value)
        ? hiddenCategories.filter((item) => item !== value)
        : [...hiddenCategories, value]
      patch({ hidden: next.join(',') || null })
    },
    [hiddenCategories, patch],
  )

  const toggleCalendar = useCallback(
    (id: string) => {
      const next = hiddenCalendars.includes(id)
        ? hiddenCalendars.filter((item) => item !== id)
        : [...hiddenCalendars, id]
      patch({ cal: next.join(',') || null })
    },
    [hiddenCalendars, patch],
  )

  const reset = useCallback(() => {
    setSearchInput('')
    lastPushedSearch.current = ''
    patch({
      q: null,
      category: null,
      priority: null,
      status: null,
      lawyer: null,
      client: null,
      case: null,
      from: null,
      to: null,
    })
  }, [patch])

  return {
    params,
    range,
    view,
    cursor,
    searchInput,
    setSearchInput,
    category,
    priority,
    status,
    lawyerId,
    clientId,
    caseId,
    from,
    to,
    page,
    hiddenCategories,
    hiddenCalendars,
    hasActiveFilters,
    agendaPageSize: AGENDA_PAGE_SIZE,
    setView: (value: CalendarViewMode) => patch({ view: value }),
    setCategory: (value: EventCategory | 'ALL') => patch({ category: value }),
    setPriority: (value: EventPriority | 'ALL') => patch({ priority: value }),
    setStatus: (value: EventStatus | 'ALL') => patch({ status: value }),
    setLawyer: (value: string) => patch({ lawyer: value || null }),
    setClient: (value: string) => patch({ client: value || null }),
    setCase: (value: string) => patch({ case: value || null }),
    setFrom: (value: string) => patch({ from: value || null }),
    setTo: (value: string) => patch({ to: value || null }),
    setPage: (value: number) => patch({ page: String(value) }, false),
    goToDate,
    goToToday: () => goToDate(new Date()),
    stepBack: () => goToDate(shiftCursor(cursor, view, -1)),
    stepForward: () => goToDate(shiftCursor(cursor, view, 1)),
    toggleCategory,
    toggleCalendar,
    reset,
  }
}

export type CalendarParamsApi = ReturnType<typeof useCalendarParams>
