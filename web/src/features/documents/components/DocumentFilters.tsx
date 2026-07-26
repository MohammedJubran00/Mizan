import { X } from 'lucide-react'

import {
  DOCUMENT_CATEGORY_LABELS,
  type DocumentCategory,
  type DocumentFacets,
} from '@/features/documents/types'
import { SearchBar } from '@/shared/components/SearchBar'

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
  'h-9 rounded-lg border border-border bg-white px-2.5 text-sm text-text outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/15'

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
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border-subtle bg-white p-3">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search title, file name, case, or client…"
        ariaLabel="Search documents"
      />

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
          const count = facets?.categories.find((item) => item.id === value)?.count
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
        disabled={!facets?.cases.length}
      >
        <option value="">All cases</option>
        {facets?.cases.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label} ({item.count})
          </option>
        ))}
      </select>

      <select
        value={clientId}
        onChange={(event) => onClientChange(event.target.value)}
        aria-label="Filter by client"
        className={selectClass}
        disabled={!facets?.clients.length}
      >
        <option value="">All clients</option>
        {facets?.clients.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label} ({item.count})
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
          Clear
        </button>
      ) : null}
    </div>
  )
}
