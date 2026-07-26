import { X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/Button'
import { PersonPicker } from '@/shared/components/PersonPicker'
import { Select } from '@/shared/components/Select'

import { categoryOptions, priorityOptions, statusOptions } from '../lib/labels'
import { searchCases, searchClients, searchLawyers } from '../lib/pickerSources'
import type { EventCategory, EventPriority, EventStatus } from '../types'

interface CalendarFiltersProps {
  category: EventCategory | 'ALL'
  priority: EventPriority | 'ALL'
  status: EventStatus | 'ALL'
  from: string
  to: string
  hasActiveFilters: boolean
  onCategoryChange: (value: EventCategory | 'ALL') => void
  onPriorityChange: (value: EventPriority | 'ALL') => void
  onStatusChange: (value: EventStatus | 'ALL') => void
  onLawyerChange: (id: string) => void
  onClientChange: (id: string) => void
  onCaseChange: (id: string) => void
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onReset: () => void
}

const compactSelect = 'h-9 w-full bg-white pl-3 pr-9'
const dateInput =
  'h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm text-text outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/15'

export function CalendarFilters({
  category,
  priority,
  status,
  from,
  to,
  hasActiveFilters,
  onCategoryChange,
  onPriorityChange,
  onStatusChange,
  onLawyerChange,
  onClientChange,
  onCaseChange,
  onFromChange,
  onToChange,
  onReset,
}: CalendarFiltersProps) {
  // The URL only carries ids, so the picker labels live with the open panel.
  const [lawyerName, setLawyerName] = useState('')
  const [clientName, setClientName] = useState('')
  const [caseLabel, setCaseLabel] = useState('')

  function resetAll() {
    setLawyerName('')
    setClientName('')
    setCaseLabel('')
    onReset()
  }

  return (
    <div className="grid gap-3 border-b border-border-subtle bg-surface-muted/60 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
      <Select
        label="Event type"
        aria-label="Filter by event type"
        className={compactSelect}
        options={[{ value: 'ALL', label: 'All event types' }, ...categoryOptions]}
        value={category}
        onChange={(event) =>
          onCategoryChange(event.target.value as EventCategory | 'ALL')
        }
      />

      <Select
        label="Priority"
        aria-label="Filter by priority"
        className={compactSelect}
        options={[{ value: 'ALL', label: 'All priorities' }, ...priorityOptions]}
        value={priority}
        onChange={(event) =>
          onPriorityChange(event.target.value as EventPriority | 'ALL')
        }
      />

      <Select
        label="Status"
        aria-label="Filter by status"
        className={compactSelect}
        options={[{ value: 'ALL', label: 'All statuses' }, ...statusOptions]}
        value={status}
        onChange={(event) => onStatusChange(event.target.value as EventStatus | 'ALL')}
      />

      <PersonPicker
        label="Assigned lawyer"
        placeholder="Search team members…"
        queryKey="calendar-filter-lawyer"
        fetchPeople={searchLawyers}
        selectedName={lawyerName}
        onSelect={(person) => {
          setLawyerName(person?.fullName ?? '')
          onLawyerChange(person?.id ?? '')
        }}
        emptyMessage="No team members available yet."
      />

      <PersonPicker
        label="Client"
        placeholder="Search clients…"
        queryKey="calendar-filter-client"
        fetchPeople={searchClients}
        selectedName={clientName}
        onSelect={(person) => {
          setClientName(person?.fullName ?? '')
          onClientChange(person?.id ?? '')
        }}
        emptyMessage="No clients found."
      />

      <PersonPicker
        label="Case"
        placeholder="Search case number or title…"
        queryKey="calendar-filter-case"
        fetchPeople={searchCases}
        selectedName={caseLabel}
        onSelect={(option) => {
          setCaseLabel(option ? `${option.caseNumber} — ${option.title}` : '')
          onCaseChange(option?.id ?? '')
        }}
        emptyMessage="No cases found."
      />

      <label className="flex w-full flex-col gap-1.5">
        <span className="text-sm font-medium text-text">From</span>
        <input
          type="date"
          value={from}
          max={to || undefined}
          aria-label="Filter events from date"
          className={dateInput}
          onChange={(event) => onFromChange(event.target.value)}
        />
      </label>

      <label className="flex w-full flex-col gap-1.5">
        <span className="text-sm font-medium text-text">To</span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          aria-label="Filter events until date"
          className={dateInput}
          onChange={(event) => onToChange(event.target.value)}
        />
      </label>

      <div className="flex items-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={resetAll}
          disabled={!hasActiveFilters}
        >
          <X className="size-4" />
          Reset filters
        </Button>
      </div>
    </div>
  )
}
