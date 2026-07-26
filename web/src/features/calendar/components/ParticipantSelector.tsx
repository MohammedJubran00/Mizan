import { X } from 'lucide-react'

import { Avatar } from '@/shared/components/Avatar'
import { PersonPicker } from '@/shared/components/PersonPicker'

import { searchLawyers } from '../lib/pickerSources'
import type { EventPersonRef } from '../types'

interface ParticipantSelectorProps {
  participants: EventPersonRef[]
  onAdd: (person: EventPersonRef) => void
  onRemove: (id: string) => void
}

export function ParticipantSelector({
  participants,
  onAdd,
  onRemove,
}: ParticipantSelectorProps) {
  return (
    <div className="space-y-3">
      <PersonPicker
        label="Participants"
        placeholder="Search team members to invite…"
        queryKey="event-participant-picker"
        fetchPeople={searchLawyers}
        selectedName=""
        resetOnSelect
        onSelect={(person) => {
          if (person) onAdd(person)
        }}
        emptyMessage="No team members available yet."
      />

      {participants.length === 0 ? (
        <p className="text-xs text-text-muted">
          No participants added yet. The lead lawyer is always notified.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {participants.map((person) => (
            <li
              key={person.id}
              className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface-muted py-1 pl-1 pr-1.5"
            >
              <Avatar name={person.fullName} size="sm" />
              <span className="max-w-40 truncate text-xs font-medium text-navy">
                {person.fullName}
              </span>
              <button
                type="button"
                aria-label={`Remove ${person.fullName}`}
                onClick={() => onRemove(person.id)}
                className="rounded-full p-1 text-text-muted transition hover:bg-white hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
