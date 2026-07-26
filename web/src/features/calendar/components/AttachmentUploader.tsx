import { Paperclip, Upload, X } from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'

import { Button } from '@/shared/components/Button'
import { cn, formatBytes } from '@/shared/lib/utils'

import {
  ACCEPTED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_MB,
  validateAttachment,
} from '../lib/eventForm'

interface AttachmentUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
  uploading?: boolean
}

export function AttachmentUploader({
  files,
  onChange,
  uploading = false,
}: AttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  function accept(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return

    const nextErrors: string[] = []
    const accepted: File[] = []

    for (const file of Array.from(incoming)) {
      const error = validateAttachment(file)
      if (error) {
        nextErrors.push(error)
        continue
      }

      const duplicate = files.some(
        (existing) => existing.name === file.name && existing.size === file.size,
      )
      if (!duplicate) accepted.push(file)
    }

    setErrors(nextErrors)
    if (accepted.length > 0) onChange([...files, ...accepted])
  }

  function onDrop(dropEvent: DragEvent<HTMLDivElement>) {
    dropEvent.preventDefault()
    setDragActive(false)
    accept(dropEvent.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(dragEvent) => {
          dragEvent.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition',
          dragActive ? 'border-blue bg-blue-soft' : 'border-border bg-surface-muted/60',
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-white text-blue">
          <Upload className="size-5" strokeWidth={1.75} />
        </span>
        <p className="text-sm font-medium text-navy">
          Drag files here or browse from your device
        </p>
        <p className="text-xs text-text-muted">
          PDF, Word, PNG, or JPEG up to {MAX_ATTACHMENT_MB} MB each
        </p>
        <Button
          size="sm"
          variant="secondary"
          type="button"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="size-4" />
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          accept={ACCEPTED_ATTACHMENT_TYPES.join(',')}
          aria-label="Attach files"
          onChange={(changeEvent) => {
            accept(changeEvent.target.files)
            changeEvent.target.value = ''
          }}
        />
      </div>

      {errors.length > 0 ? (
        <ul className="space-y-1" role="alert">
          {errors.map((error) => (
            <li key={error} className="text-xs text-danger">
              {error}
            </li>
          ))}
        </ul>
      ) : null}

      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center gap-3 rounded-xl border border-border-subtle bg-white px-3 py-2"
            >
              <Paperclip className="size-4 shrink-0 text-blue" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy">{file.name}</p>
                <p className="text-xs text-text-muted">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() =>
                  onChange(
                    files.filter(
                      (item) => !(item.name === file.name && item.size === file.size),
                    ),
                  )
                }
                className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
