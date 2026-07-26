import { History, StickyNote } from 'lucide-react'

import { FileTable } from '@/shared/components/FileTable'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatDateTime } from '@/shared/lib/utils'
import type { FileRef } from '@/shared/types/files'

import type { HearingNote, HearingTimelineEvent } from '../../types'

export function TimelineTab({ events }: { events: HearingTimelineEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )

  return (
    <SectionCard title="Timeline" icon={History}>
      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">
          No timeline events have been recorded for this hearing yet.
        </p>
      ) : (
        <ol className="space-y-4">
          {sorted.map((event, index) => (
            <li key={event.id} className="relative flex gap-3">
              {index < sorted.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[7px] top-5 h-[calc(100%+0.5rem)] w-px bg-border-subtle"
                />
              ) : null}
              <span
                aria-hidden="true"
                className="mt-1.5 size-3.5 shrink-0 rounded-full border-2 border-blue bg-white"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-navy">{event.title}</p>
                  <time dateTime={event.occurredAt} className="text-xs text-text-muted">
                    {formatDateTime(event.occurredAt)}
                  </time>
                </div>
                {event.description ? (
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {event.description}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  )
}

export function DocumentsTab({ documents }: { documents: FileRef[] }) {
  return (
    <SectionCard title="Documents" bodyClassName="px-2 py-2">
      <FileTable
        files={documents}
        caption="Documents linked to this hearing"
        emptyDescription="Transcripts and filings attached to this hearing will appear here."
      />
    </SectionCard>
  )
}

export function NotesTab({ notes }: { notes: HearingNote[] }) {
  const sorted = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <SectionCard title="Notes" icon={StickyNote}>
      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">
          No notes have been recorded for this hearing yet.
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
                  {note.title ?? 'Hearing note'}
                </p>
                <time dateTime={note.createdAt} className="text-xs text-text-muted">
                  {formatDateTime(note.createdAt)}
                </time>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-text-secondary">
                {note.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
