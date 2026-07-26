import { StickyNote } from 'lucide-react'

import { Badge } from '@/shared/components/Badge'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatDateTime } from '@/shared/lib/utils'

import type { CaseNote } from '../../types'

export function NotesTab({ notes }: { notes: CaseNote[] }) {
  const sorted = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <SectionCard title="Notes" icon={StickyNote}>
      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">
          No notes have been recorded on this matter yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-border-subtle bg-surface-muted px-3.5 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-semibold text-navy">
                  {note.title ?? 'Case note'}
                </p>
                <div className="flex items-center gap-2">
                  {note.shared ? <Badge variant="info">Shared</Badge> : null}
                  <time
                    dateTime={note.createdAt}
                    className="text-xs text-text-muted"
                  >
                    {formatDateTime(note.createdAt)}
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
  )
}
