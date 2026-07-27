import { SlidersHorizontal, X } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { SearchBar } from '@/shared/components/SearchBar'
import { Select } from '@/shared/components/Select'
import { cn } from '@/shared/lib/utils'

import {
  casePriorityLabels,
  casePriorityOptions,
  caseSortOptions,
  caseStatusLabels,
  caseStatusOptions,
  practiceAreaLabels,
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

const toolbarSelect =
  'h-9 min-w-[9.5rem] border-border-subtle bg-surface-muted/60 pl-3 pr-9 hover:bg-white'

interface FilterChip {
  id: string
  label: string
  onClear: () => void
}

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
  const chips: FilterChip[] = []

  if (search.trim()) {
    chips.push({
      id: 'search',
      label: `Search: “${search.trim()}”`,
      onClear: () => onSearchChange(''),
    })
  }
  if (practiceArea !== 'ALL') {
    chips.push({
      id: 'area',
      label: practiceAreaLabels[practiceArea],
      onClear: () => onPracticeAreaChange('ALL'),
    })
  }
  if (status !== 'ALL') {
    chips.push({
      id: 'status',
      label: caseStatusLabels[status],
      onClear: () => onStatusChange('ALL'),
    })
  }
  if (priority !== 'ALL') {
    chips.push({
      id: 'priority',
      label: `${casePriorityLabels[priority]} priority`,
      onClear: () => onPriorityChange('ALL'),
    })
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-sm shadow-navy/5"
      role="search"
    >
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          searching={searching}
          placeholder="Search case number, title, or client…"
          ariaLabel="Search cases"
        />

        {hasActiveFilters ? (
          <Button
            size="sm"
            variant="ghost"
            className="shrink-0 self-start sm:self-auto"
            onClick={onReset}
          >
            <X className="size-4" />
            Clear all
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 border-t border-border-subtle bg-surface-muted/30 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          <SlidersHorizontal className="size-3.5" />
          Filters
        </span>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Select
            aria-label="Filter by practice area"
            fullWidth={false}
            className={cn(toolbarSelect, practiceArea !== 'ALL' && 'border-blue bg-white')}
            options={[
              { value: 'ALL', label: 'All practice areas' },
              ...practiceAreaOptions,
            ]}
            value={practiceArea}
            onChange={(event) =>
              onPracticeAreaChange(event.target.value as PracticeArea | 'ALL')
            }
          />

          <Select
            aria-label="Filter by status"
            fullWidth={false}
            className={cn(toolbarSelect, status !== 'ALL' && 'border-blue bg-white')}
            options={[{ value: 'ALL', label: 'All statuses' }, ...caseStatusOptions]}
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as CaseStatus | 'ALL')
            }
          />

          <Select
            aria-label="Filter by priority"
            fullWidth={false}
            className={cn(toolbarSelect, priority !== 'ALL' && 'border-blue bg-white')}
            options={[
              { value: 'ALL', label: 'All priorities' },
              ...casePriorityOptions,
            ]}
            value={priority}
            onChange={(event) =>
              onPriorityChange(event.target.value as CasePriority | 'ALL')
            }
          />
        </div>

        <Select
          aria-label="Sort cases"
          fullWidth={false}
          className={cn(toolbarSelect, 'sm:ms-auto')}
          options={caseSortOptions}
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
        />
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border-subtle px-3 py-2">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={chip.onClear}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-blue/20 bg-blue-soft/70 px-2.5 py-1 text-xs font-medium text-blue transition hover:bg-blue-soft"
            >
              <span className="truncate">{chip.label}</span>
              <X className="size-3 shrink-0 opacity-70" aria-hidden="true" />
              <span className="sr-only">Remove {chip.label} filter</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
