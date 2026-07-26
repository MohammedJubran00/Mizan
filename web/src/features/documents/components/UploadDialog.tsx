import { useRef, useState, type FormEvent } from 'react'
import { FileUp, X } from 'lucide-react'

import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
  type DocumentFacets,
} from '@/features/documents/types'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { cn, formatBytes } from '@/shared/lib/utils'

interface UploadDialogProps {
  open: boolean
  onClose: () => void
  facets: DocumentFacets | undefined
  maxUploadMb: number
  uploading: boolean
  progress: number
  error: string | null
  onSubmit: (payload: {
    file: File
    title?: string
    description?: string
    category: DocumentCategory
    caseId?: string
    clientId?: string
  }) => void
}

const selectClass =
  'h-11 w-full rounded-lg border border-border bg-[#f3f4f6] px-3 text-sm text-text outline-none transition focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/15'

export function UploadDialog({
  open,
  onClose,
  facets,
  maxUploadMb,
  uploading,
  progress,
  error,
  onSubmit,
}: UploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<DocumentCategory>('OTHER')
  const [caseId, setCaseId] = useState('')
  const [clientId, setClientId] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  if (!open) return null

  function pickFile(selected: File | undefined) {
    if (!selected) return

    const isPdf =
      selected.type === 'application/pdf' || /\.pdf$/i.test(selected.name)

    if (!isPdf) {
      setLocalError('Only PDF files can be uploaded.')
      return
    }

    if (selected.size > maxUploadMb * 1024 * 1024) {
      setLocalError(`File exceeds the ${maxUploadMb}MB upload limit.`)
      return
    }

    setLocalError(null)
    setFile(selected)
    if (!title) setTitle(selected.name.replace(/\.pdf$/i, ''))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) {
      setLocalError('Select a PDF file to upload.')
      return
    }
    onSubmit({
      file,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      category,
      caseId: caseId || undefined,
      clientId: clientId || undefined,
    })
  }

  const message = localError ?? error

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close upload dialog"
        className="fixed inset-0 bg-navy-deep/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-border-subtle bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-navy">Upload document</h2>
            <p className="mt-0.5 text-xs text-text-muted">
              PDF only, up to {maxUploadMb}MB
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition hover:bg-surface-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {message ? (
            <div
              role="alert"
              className="rounded-lg border border-danger/20 bg-danger/5 px-3.5 py-3 text-sm text-danger"
            >
              {message}
            </div>
          ) : null}

          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              pickFile(event.dataTransfer.files?.[0])
            }}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition',
              dragging ? 'border-blue bg-blue-soft/50' : 'border-border bg-surface-muted/50',
            )}
          >
            <FileUp className="size-7 text-blue" strokeWidth={1.75} />
            {file ? (
              <div>
                <p className="text-sm font-medium text-text">{file.name}</p>
                <p className="text-xs text-text-muted">{formatBytes(file.size)}</p>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                Drag a PDF here, or choose a file
              </p>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => pickFile(event.target.files?.[0])}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              {file ? 'Choose another file' : 'Choose file'}
            </Button>
          </div>

          <Input
            label="Title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Defendant's motion to dismiss"
            hint="Defaults to the file name when left blank."
          />

          <label className="flex w-full flex-col gap-1.5">
            <span className="text-sm font-medium text-text">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-[#f3f4f6] px-3.5 py-2.5 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/15"
              placeholder="Optional context for your team"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text">Category</span>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as DocumentCategory)
                }
                className={selectClass}
              >
                {DOCUMENT_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {DOCUMENT_CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text">Case</span>
              <select
                value={caseId}
                onChange={(event) => setCaseId(event.target.value)}
                className={selectClass}
                disabled={!facets?.cases.length}
              >
                <option value="">Unlinked</option>
                {facets?.cases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text">Client</span>
              <select
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className={selectClass}
                disabled={!facets?.clients.length}
              >
                <option value="">Unlinked</option>
                {facets?.clients.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {uploading ? (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
              <div
                className="h-full rounded-full bg-blue transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={uploading} disabled={!file}>
              Upload
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
