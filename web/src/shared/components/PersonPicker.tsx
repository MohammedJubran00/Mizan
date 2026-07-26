import { useQuery } from '@tanstack/react-query'
import { Loader2, Search, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

import { Avatar } from '@/shared/components/Avatar'
import { Button } from '@/shared/components/Button'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { cn } from '@/shared/lib/utils'

/** Minimum shape every module's person reference satisfies. */
export interface PersonOption {
  id: string
  fullName: string
  subtitle?: string | null
}

interface PersonPickerProps<T extends PersonOption> {
  label: string
  placeholder: string
  /** Namespace for the search query cache, e.g. "case-client-picker". */
  queryKey: string
  fetchPeople: (search: string) => Promise<T[]>
  selectedName: string
  onSelect: (person: T | null) => void
  emptyMessage: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
  error?: string
  required?: boolean
  /** Clears the field after choosing, for multi-select pickers. */
  resetOnSelect?: boolean
  onBlurField?: () => void
}

export function PersonPicker<T extends PersonOption>({
  label,
  placeholder,
  queryKey,
  fetchPeople,
  selectedName,
  onSelect,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  error,
  required,
  resetOnSelect = false,
  onBlurField,
}: PersonPickerProps<T>) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const debouncedQuery = useDebouncedValue(query, 250)

  const peopleQuery = useQuery({
    queryKey: [queryKey, debouncedQuery],
    queryFn: () => fetchPeople(debouncedQuery.trim()),
    enabled: open,
  })

  const people = peopleQuery.data ?? []

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        onBlurField?.()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open, onBlurField])

  useEffect(() => setActiveIndex(0), [debouncedQuery])

  function choose(person: T) {
    onSelect(person)
    setOpen(false)
    setQuery(resetOnSelect ? '' : person.fullName)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      if (people.length === 0) return
      const delta = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((current) => (current + delta + people.length) % people.length)
      return
    }

    if (event.key === 'Enter' && open) {
      const person = people[activeIndex]
      if (person) {
        event.preventDefault()
        choose(person)
      }
    }
  }

  const inputValue = resetOnSelect ? query : selectedName || query

  return (
    <div ref={containerRef} className="relative flex w-full flex-col gap-1.5">
      <span className="text-sm font-medium text-text">
        {label}
        {required ? <span className="ml-0.5 text-danger">*</span> : null}
      </span>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label={label}
          aria-invalid={error ? true : undefined}
          value={inputValue}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            if (!resetOnSelect && selectedName) onSelect(null)
          }}
          onKeyDown={onKeyDown}
          className={cn(
            'h-11 w-full rounded-lg border bg-[#f3f4f6] pl-9 pr-9 text-sm text-text outline-none transition',
            'placeholder:text-text-muted focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/15',
            error
              ? 'border-danger focus:border-danger focus:ring-danger/15'
              : 'border-border',
          )}
        />

        {peopleQuery.isFetching ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-text-muted" />
        ) : selectedName && !resetOnSelect ? (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onClick={() => {
              onSelect(null)
              setQuery('')
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-muted transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {error ? <span className="text-xs text-danger">{error}</span> : null}

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute top-full z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border-subtle bg-white py-1 shadow-lg"
        >
          {peopleQuery.isPending ? (
            <p className="px-3 py-3 text-sm text-text-muted">Searching…</p>
          ) : peopleQuery.isError ? (
            <p className="px-3 py-3 text-sm text-danger">
              Could not load results. Please try again.
            </p>
          ) : people.length === 0 ? (
            <div className="px-3 py-3">
              <p className="text-sm text-text-muted">{emptyMessage}</p>
              {emptyActionLabel && onEmptyAction ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2 w-full"
                  onClick={() => {
                    setOpen(false)
                    onEmptyAction()
                  }}
                >
                  {emptyActionLabel}
                </Button>
              ) : null}
            </div>
          ) : (
            people.map((person, index) => (
              <button
                key={person.id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(person)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left transition',
                  index === activeIndex ? 'bg-surface-muted' : 'bg-white',
                )}
              >
                <Avatar name={person.fullName} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-navy">
                    {person.fullName}
                  </span>
                  {person.subtitle ? (
                    <span className="block truncate text-xs text-text-muted">
                      {person.subtitle}
                    </span>
                  ) : null}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
