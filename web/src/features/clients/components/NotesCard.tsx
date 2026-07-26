import { NotebookPen, Pencil } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/Button'
import { SectionCard } from '@/shared/components/SectionCard'
import { Textarea } from '@/shared/components/Textarea'

interface NotesCardProps {
  notes?: string | null
  onSave: (notes: string) => void
  pending?: boolean
}

export function NotesCard({ notes, onSave, pending }: NotesCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(notes ?? '')

  function startEditing() {
    setDraft(notes ?? '')
    setEditing(true)
  }

  function submit() {
    onSave(draft.trim())
    setEditing(false)
  }

  return (
    <SectionCard
      title="Private Notes"
      description="Visible to your workspace only"
      icon={NotebookPen}
      action={
        editing ? null : (
          <button
            type="button"
            onClick={startEditing}
            aria-label="Edit private notes"
            className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-muted hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
          >
            <Pencil className="size-4" />
          </button>
        )
      }
    >
      {editing ? (
        <div className="space-y-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={5}
            placeholder="Document preferences, context or background information…"
            aria-label="Private notes"
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={submit} loading={pending}>
              Save notes
            </Button>
          </div>
        </div>
      ) : notes ? (
        <p className="whitespace-pre-wrap border-l-2 border-gold pl-3 text-sm italic leading-relaxed text-text-secondary">
          {notes}
        </p>
      ) : (
        <p className="text-sm text-text-muted">
          No notes yet. Add context that should stay internal.
        </p>
      )}
    </SectionCard>
  )
}
