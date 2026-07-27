import { SlidersHorizontal, X } from 'lucide-react'

import {
  DOCUMENT_CATEGORY_LABELS,
  type DocumentCategory,
  type DocumentFacets,
} from '@/features/documents/types'
import { SearchBar } from '@/shared/components/SearchBar'
import { cn } from '@/shared/lib/utils'

interface DocumentFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: DocumentCategory | ''
  onCategoryChange: (value: DocumentCategory | '') => void
  caseId: string
  onCaseChange: (value: string) => void
  clientId: string
  onClientChange: (value: string) => void
  facets: DocumentFacets | undefined
  onReset: () => void
  hasActiveFilters: boolean
}

const selectClass =
  'h-9 min-w-[9.5rem] rounded-lg border border-border-subtle bg-surface-muted/60 px-2.5 text-sm text-text outline-none transition hover:bg-white focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/15'

interface FilterChip {
  id: string
  label: string
  onClear: () => void
}

export function DocumentFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  caseId,
  onCaseChange,
  clientId,
  onClientChange,
  facets,
  onReset,
  hasActiveFilters,
}: DocumentFiltersProps) {
  const chips: FilterChip[] = []

  if (search.trim()) {
    chips.push({
      id: 'search',
      label: `Search: “${search.trim()}”`,
      onClear: () => onSearchChange(''),
    })
  }
  if (category) {
    chips.push({
      id: 'category',
      label: DOCUMENT_CATEGORY_LABELS[category],
      onClear: () => onCategoryChange(''),
    })
  }
  if (caseId) {
    const label =
      facets?.cases.find((item) => item.id === caseId)?.label ?? 'Selected case'
    chips.push({
      id: 'case',
      label,
      onClear: () => onCaseChange(''),
    })
  }
  if (clientId) {
    const label =
      facets?.clients.find((item) => item.id === clientId)?.label ??
      'Selected client'
    chips.push({
      id: 'client',
      label,
      onClear: () => onClientChange(''),
    })
  }

  return (
    <div className="space-y-2.5 rounded-2xl border border-border-subtle bg-white p-3 shadow-[0_1px_2px_rgba(26,46,90,0.04)]">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder="Search title, file name, case, or client…"
            ariaLabel="Search documents"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-1.5 text-xs font-medium text-text-muted sm:inline-flex">
            <SlidersHorizontal className="size-3.5" />
            Filters
          </span>

          <select
            value={category}
            onChange={(event) =>
              onCategoryChange(event.target.value as DocumentCategory | '')
            }
            aria-label="Filter by category"
            className={selectClass}
          >
            <option value="">All categories</option>
            {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => {
              const count = facets?.categories.find(
                (item) => item.id === value,
              )?.count
              return (
                <option key={value} value={value}>
                  {label}
                  {count ? ` (${count})` : ''}
                </option>
              )
            })}
          </select>

          <select
            value={caseId}
            onChange={(event) => onCaseChange(event.target.value)}
            aria-label="Filter by case"
            className={selectClass}
          >
            <option value="">All cases</option>
            {facets?.cases.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
                {item.count ? ` (${item.count})` : ''}
              </option>
            ))}
          </select>

          <select
            value={clientId}
            onChange={(event) => onClientChange(event.target.value)}
            aria-label="Filter by client"
            className={selectClass}
          >
            <option value="">All clients</option>
            {facets?.clients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
                {item.count ? ` (${item.count})` : ''}
              </option>
            ))}
          </select>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-muted"
            >
              <X className="size-3.5" />
              Clear all
            </button>
          ) : null}
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={chip.onClear}
              className={cn(
                'inline-flex max-w-full items-center gap-1.5 rounded-full bg-blue-soft px-2.5 py-1 text-xs font-medium text-navy transition hover:bg-blue/15',
              )}
            >
              <span className="truncate">{chip.label}</span>
              <X className="size-3 shrink-0 opacity-70" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
