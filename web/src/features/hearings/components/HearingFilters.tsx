import { SlidersHorizontal, X } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { SearchBar } from '@/shared/components/SearchBar'
import { Select } from '@/shared/components/Select'

import {
  hearingSortOptions,
  hearingStatusOptions,
  hearingTypeOptions,
} from '../lib/labels'
import type { HearingStatus, HearingType } from '../types'

interface HearingFiltersProps {
  search: string
  status: HearingStatus | 'ALL'
  type: HearingType | 'ALL'
  sort: string
  searching: boolean
  hasActiveFilters: boolean
  onSearchChange: (value: string) => void
  onStatusChange: (value: HearingStatus | 'ALL') => void
  onTypeChange: (value: HearingType | 'ALL') => void
  onSortChange: (value: string) => void
  onReset: () => void
}

const compactSelect = 'h-9 w-auto min-w-40 bg-white pl-3 pr-9'

export function HearingFilters({
  search,
  status,
  type,
  sort,
  searching,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onSortChange,
  onReset,
}: HearingFiltersProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-border-subtle bg-white p-3"
      role="search"
    >
      <SearchBar
        value={search}
        onChange={onSearchChange}
        searching={searching}
        placeholder="Search hearings, cases, or judges…"
        ariaLabel="Search hearings"
      />

      <span className="hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted lg:inline-flex">
        <SlidersHorizontal className="size-4" />
        Filters
      </span>

      <Select
        aria-label="Filter by status"
        className={compactSelect}
        options={[{ value: 'ALL', label: 'All statuses' }, ...hearingStatusOptions]}
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as HearingStatus | 'ALL')
        }
      />

      <Select
        aria-label="Filter by type"
        className={compactSelect}
        options={[{ value: 'ALL', label: 'All types' }, ...hearingTypeOptions]}
        value={type}
        onChange={(event) =>
          onTypeChange(event.target.value as HearingType | 'ALL')
        }
      />

      <Select
        aria-label="Sort hearings"
        className={compactSelect}
        options={hearingSortOptions}
        value={sort}
        onChange={(event) => onSortChange(event.target.value)}
      />

      {hasActiveFilters ? (
        <Button size="sm" variant="ghost" onClick={onReset}>
          <X className="size-4" />
          Clear
        </Button>
      ) : null}
    </div>
  )
}
