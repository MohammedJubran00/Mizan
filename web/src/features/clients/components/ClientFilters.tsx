import { X } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { SearchBar } from '@/shared/components/SearchBar'
import { Select } from '@/shared/components/Select'

import { clientStatusLabels } from '../lib/labels'
import type { ClientStatus } from '../types'

const statusOptions = [
  { value: 'ALL', label: 'All statuses' },
  ...(Object.keys(clientStatusLabels) as ClientStatus[]).map((status) => ({
    value: status,
    label: clientStatusLabels[status],
  })),
]

interface ClientFiltersProps {
  search: string
  status: ClientStatus | 'ALL'
  onSearchChange: (value: string) => void
  onStatusChange: (value: ClientStatus | 'ALL') => void
  onReset: () => void
  hasActiveFilters: boolean
}

export function ClientFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onReset,
  hasActiveFilters,
}: ClientFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border-subtle bg-white p-3">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search by name, company, or email…"
        ariaLabel="Search clients"
      />

      <Select
        aria-label="Filter by status"
        className="h-9 w-auto min-w-40 bg-white pl-3 pr-9"
        options={statusOptions}
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as ClientStatus | 'ALL')
        }
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
