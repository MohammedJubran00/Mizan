import { useEffect, useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'

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
}

export function DocumentDetails({
  document,
  saving,
  onSave,
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

  return (
    <section className="rounded-2xl border border-border-subtle bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {editing ? (
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-label="Document title"
              className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm font-semibold text-text outline-none focus:border-blue focus:ring-4 focus:ring-blue/15"
            />
          ) : (
            <h3 className="truncate font-display text-lg text-navy">
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
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-lg p-2 text-text-muted transition hover:bg-surface-muted hover:text-navy"
            aria-label="Edit document details"
          >
            <Pencil className="size-4" />
          </button>
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
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
          <Detail label="Category" value={DOCUMENT_CATEGORY_LABELS[document.category]} />
          <Detail label="Uploaded" value={formatShortDate(document.createdAt)} />
          <Detail
            label="Case"
            value={
              document.caseTitle
                ? document.caseNumber
                  ? `${document.caseNumber} — ${document.caseTitle}`
                  : document.caseTitle
                : 'Unlinked'
            }
          />
          <Detail label="Client" value={document.clientName ?? 'Unlinked'} />
          <Detail
            label="Uploaded by"
            value={document.uploadedBy?.fullName ?? 'Unknown'}
          />
          <Detail label="Size" value={formatBytes(document.sizeBytes)} />
          {document.description ? (
            <div className="col-span-2">
              <dt className="text-text-muted">Description</dt>
              <dd className="mt-0.5 text-text-secondary">
                {document.description}
              </dd>
            </div>
          ) : null}
        </dl>
      )}
    </section>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-text-muted">{label}</dt>
      <dd className="mt-0.5 truncate font-medium text-text">{value}</dd>
    </div>
  )
}
