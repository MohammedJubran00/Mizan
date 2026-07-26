import { SlidersHorizontal, X } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { SearchBar } from '@/shared/components/SearchBar'
import { Select } from '@/shared/components/Select'

import {
  casePriorityOptions,
  caseSortOptions,
  caseStatusOptions,
  practiceAreaOptions,
} from '../lib/labels'
import type { CasePriority, CaseStatus, PracticeArea } from '../types'

interface CaseFiltersProps {
  search: string
  status: CaseStatus | 'ALL'
  practiceArea: PracticeArea | 'ALL'
  priority: CasePriority | 'ALL'
  sort: string
  searching: boolean
  hasActiveFilters: boolean
  onSearchChange: (value: string) => void
  onStatusChange: (value: CaseStatus | 'ALL') => void
  onPracticeAreaChange: (value: PracticeArea | 'ALL') => void
  onPriorityChange: (value: CasePriority | 'ALL') => void
  onSortChange: (value: string) => void
  onReset: () => void
}

const compactSelect = 'h-9 w-auto min-w-40 bg-white pl-3 pr-9'

export function CaseFilters({
  search,
  status,
  practiceArea,
  priority,
  sort,
  searching,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onPracticeAreaChange,
  onPriorityChange,
  onSortChange,
  onReset,
}: CaseFiltersProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-border-subtle bg-white p-3"
      role="search"
    >
      <SearchBar
        value={search}
        onChange={onSearchChange}
        searching={searching}
        placeholder="Search case number, title, or client…"
        ariaLabel="Search cases"
      />

      <span className="hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted lg:inline-flex">
        <SlidersHorizontal className="size-4" />
        Filters
      </span>

      <Select
        aria-label="Filter by practice area"
        className={compactSelect}
        options={[{ value: 'ALL', label: 'All practice areas' }, ...practiceAreaOptions]}
        value={practiceArea}
        onChange={(event) =>
          onPracticeAreaChange(event.target.value as PracticeArea | 'ALL')
        }
      />

      <Select
        aria-label="Filter by status"
        className={compactSelect}
        options={[{ value: 'ALL', label: 'All statuses' }, ...caseStatusOptions]}
        value={status}
        onChange={(event) => onStatusChange(event.target.value as CaseStatus | 'ALL')}
      />

      <Select
        aria-label="Filter by priority"
        className={compactSelect}
        options={[{ value: 'ALL', label: 'All priorities' }, ...casePriorityOptions]}
        value={priority}
        onChange={(event) =>
          onPriorityChange(event.target.value as CasePriority | 'ALL')
        }
      />

      <Select
        aria-label="Sort cases"
        className={compactSelect}
        options={caseSortOptions}
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
