import { StickyNote } from 'lucide-react'

import { EmptyState } from '@/shared/components/EmptyState'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatDateTime } from '@/shared/lib/utils'

import type { InvoiceNote } from '../../types'

interface NotesTabProps {
  notes: InvoiceNote[]
}

export function NotesTab({ notes }: NotesTabProps) {
  return (
    <SectionCard title="Notes" icon={StickyNote}>
      {notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Internal billing notes for this invoice will appear here."
          className="border-0 py-10"
        />
      ) : (
        <ul className="space-y-4">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-border-subtle bg-surface-muted/40 p-4"
            >
              <p className="text-sm leading-relaxed text-text-secondary">
                {note.body}
              </p>
              <p className="mt-2 text-xs text-text-muted">
                {note.authorName ? `${note.authorName} · ` : ''}
                {formatDateTime(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
