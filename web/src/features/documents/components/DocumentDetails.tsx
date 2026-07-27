import { useEffect, useState } from 'react'
import {
  Briefcase,
  Check,
  Pencil,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'

import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  type DocumentCategory,
  type DocumentItem,
} from '@/features/documents/types'
import { Button } from '@/shared/components/Button'
import { formatBytes, formatShortDate } from '@/shared/lib/utils'

interface DocumentDetailsProps {
  document: DocumentItem
  saving: boolean
  onSave: (payload: {
    title: string
    description: string | null
    category: DocumentCategory
  }) => void
  onDelete: () => void
}

export function DocumentDetails({
  document,
  saving,
  onSave,
  onDelete,
}: DocumentDetailsProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(document.title)
  const [description, setDescription] = useState(document.description ?? '')
  const [category, setCategory] = useState<DocumentCategory>(document.category)

  useEffect(() => {
    setEditing(false)
    setTitle(document.title)
    setDescription(document.description ?? '')
    setCategory(document.category)
  }, [document])

  const caseLabel = document.caseTitle
    ? document.caseNumber
      ? `${document.caseNumber} — ${document.caseTitle}`
      : document.caseTitle
    : 'Unlinked'

  return (
    <section className="rounded-2xl border border-border-subtle bg-white p-4 shadow-[0_1px_2px_rgba(26,46,90,0.04)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-label="Document title"
              className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm font-semibold text-text outline-none focus:border-blue focus:ring-4 focus:ring-blue/15"
            />
          ) : (
            <h3 className="truncate font-display text-xl text-navy">
              {document.title}
            </h3>
          )}
          <p className="mt-0.5 truncate text-xs text-text-muted">
            {document.fileName} · {formatBytes(document.sizeBytes)}
          </p>
        </div>

        {editing ? (
          <div className="flex shrink-0 gap-1">
            <Button
              size="sm"
              loading={saving}
              onClick={() =>
                onSave({
                  title: title.trim() || document.title,
                  description: description.trim() ? description.trim() : null,
                  category,
                })
              }
            >
              <Check className="size-3.5" />
              Save
            </Button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg p-2 text-text-muted transition hover:bg-surface-muted"
              aria-label="Cancel editing"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={onDelete}>
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-secondary">
              Description
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text outline-none focus:border-blue focus:ring-4 focus:ring-blue/15"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-secondary">
              Category
            </span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as DocumentCategory)
              }
              className="h-9 rounded-lg border border-border bg-white px-2.5 text-sm text-text outline-none focus:border-blue focus:ring-4 focus:ring-blue/15"
            >
              {DOCUMENT_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {DOCUMENT_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <MetaChip
            label="Category"
            value={DOCUMENT_CATEGORY_LABELS[document.category]}
          />
          <MetaChip
            label="Uploaded"
            value={formatShortDate(document.createdAt)}
          />
          <MetaChip
            label="Case"
            value={caseLabel}
            icon={Briefcase}
          />
          <MetaChip
            label="Client"
            value={document.clientName ?? 'Unlinked'}
            icon={UserRound}
          />
          <MetaChip
            label="Uploaded by"
            value={document.uploadedBy?.fullName ?? 'Unknown'}
          />
          <MetaChip label="Size" value={formatBytes(document.sizeBytes)} />
          {document.description ? (
            <div className="sm:col-span-2 rounded-xl bg-surface-muted/70 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                Description
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                {document.description}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

function MetaChip({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: typeof Briefcase
}) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-muted/70 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-medium text-navy">
        {Icon ? <Icon className="size-3.5 shrink-0 text-text-muted" /> : null}
        <span className="truncate">{value}</span>
      </p>
    </div>
  )
}
