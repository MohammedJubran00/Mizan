import { Filter, Search } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { SearchBar } from '@/shared/components/SearchBar'
import { Select } from '@/shared/components/Select'

import { INVOICE_STATUS_FILTERS } from '../lib/labels'
import type { InvoiceStatus } from '../types'

interface BillingFiltersProps {
  search: string
  status: InvoiceStatus | 'ALL'
  searching?: boolean
  hasActiveFilters: boolean
  filtersOpen: boolean
  onSearchChange: (value: string) => void
  onStatusChange: (value: InvoiceStatus | 'ALL') => void
  onToggleFilters: () => void
  onReset: () => void
}

export function BillingFilters({
  search,
  status,
  searching,
  hasActiveFilters,
  filtersOpen,
  onSearchChange,
  onStatusChange,
  onToggleFilters,
  onReset,
}: BillingFiltersProps) {
  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder="Search invoices, clients, cases…"
            ariaLabel="Search invoices"
            searching={searching}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={filtersOpen || hasActiveFilters ? 'secondary' : 'ghost'}
            onClick={onToggleFilters}
            aria-expanded={filtersOpen}
          >
            <Filter className="size-4" />
            Filter
          </Button>
          {hasActiveFilters ? (
            <Button size="sm" variant="ghost" onClick={onReset}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      {filtersOpen ? (
        <div className="grid gap-3 border-t border-border-subtle pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Status"
            options={INVOICE_STATUS_FILTERS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as InvoiceStatus | 'ALL')
            }
          />
        </div>
      ) : null}

      {!filtersOpen && hasActiveFilters ? (
        <p className="flex items-center gap-2 text-xs text-text-muted">
          <Search className="size-3.5" />
          Active filters applied to this invoice list.
        </p>
      ) : null}
    </Card>
  )
}
