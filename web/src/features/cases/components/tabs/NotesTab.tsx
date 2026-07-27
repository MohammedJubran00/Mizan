import { Plus, StickyNote } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { SectionCard } from '@/shared/components/SectionCard'

import { formatNoteDateTime } from '../../lib/noteDate'
import type { CaseNote } from '../../types'
import { AddNoteDialog } from '../AddNoteDialog'

interface NotesTabProps {
  notes: CaseNote[]
  saving?: boolean
  onAddNote: (payload: { title: string; body: string }) => void | Promise<unknown>
}

export function NotesTab({ notes, saving = false, onAddNote }: NotesTabProps) {
  const [open, setOpen] = useState(false)

  const sorted = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <>
      <SectionCard
        title="Notes"
        icon={StickyNote}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add note
          </Button>
        }
      >
        {sorted.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-text-muted">
              No notes have been recorded on this matter yet.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-4"
              onClick={() => setOpen(true)}
            >
              <Plus className="size-4" />
              Add note
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {sorted.map((note) => (
              <li
                key={note.id}
                className="rounded-xl border border-border-subtle bg-surface-muted px-3.5 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-navy">
                    {note.title?.trim() || 'Case note'}
                  </p>
                  <div className="flex items-center gap-2">
                    {note.shared ? <Badge variant="info">Shared</Badge> : null}
                    <time
                      dateTime={note.createdAt}
                      className="text-xs text-text-muted"
                    >
                      {formatNoteDateTime(note.createdAt)}
                    </time>
                  </div>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                  {note.body}
                </p>
                {note.authorName ? (
                  <p className="mt-1.5 text-xs text-text-muted">{note.authorName}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <AddNoteDialog
        open={open}
        saving={saving}
        onClose={() => {
          if (!saving) setOpen(false)
        }}
        onSubmit={(payload) => {
          void Promise.resolve(onAddNote(payload))
            .then(() => setOpen(false))
            .catch(() => undefined)
        }}
      />
    </>
  )
}
