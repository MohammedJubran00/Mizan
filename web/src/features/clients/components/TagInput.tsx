import { Plus, X } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'

import { cn } from '@/shared/lib/utils'

interface TagInputProps {
  values: string[]
  onAdd: (label: string) => void
  onRemove: (label: string) => void
  disabled?: boolean
  placeholder?: string
  label?: string
  emptyLabel?: string
  /** Keeps the add field hidden behind a button until requested. */
  collapsible?: boolean
  className?: string
}

export function TagInput({
  values,
  onAdd,
  onRemove,
  disabled = false,
  placeholder = 'Add tag…',
  label,
  emptyLabel = 'No tags yet.',
  collapsible = false,
  className,
}: TagInputProps) {
  const [draft, setDraft] = useState('')
  const [expanded, setExpanded] = useState(!collapsible)

  function commit() {
    if (!draft.trim()) return
    onAdd(draft)
    setDraft('')
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit()
      return
    }

    if (event.key === 'Backspace' && !draft && values.length > 0) {
      onRemove(values[values.length - 1])
    }
  }

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {label ? (
        <span className="text-sm font-medium text-text">{label}</span>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {values.length === 0 && !expanded ? (
          <span className="text-sm text-text-muted">{emptyLabel}</span>
        ) : null}

        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-blue-soft px-2.5 py-1 text-xs font-semibold text-blue"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              disabled={disabled}
              aria-label={`Remove tag ${tag}`}
              className="rounded-full p-0.5 transition hover:bg-blue/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30 disabled:opacity-50"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        {collapsible && !expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-semibold text-text-secondary transition hover:border-blue hover:text-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30 disabled:opacity-50"
          >
            <Plus className="size-3" />
            Add tag
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={commit}
            disabled={disabled}
            placeholder={placeholder}
            aria-label={label ?? 'Add tag'}
            className={cn(
              'h-10 w-full rounded-lg border border-border bg-[#f3f4f6] px-3 text-sm text-text outline-none transition',
              'placeholder:text-text-muted focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/15 disabled:opacity-60',
            )}
          />
        </div>
      ) : null}
    </div>
  )
}
