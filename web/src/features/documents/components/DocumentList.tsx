import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  FileText,
  Trash2,
  UserRound,
} from 'lucide-react'

import {
  DOCUMENT_CATEGORY_LABELS,
  type DocumentItem,
  type DocumentSortField,
  type SortDirection,
} from '@/features/documents/types'
import { Button } from '@/shared/components/Button'
import { Skeleton } from '@/shared/components/Skeleton'
import { cn, formatBytes, formatShortDate } from '@/shared/lib/utils'

interface DocumentListProps {
  items: DocumentItem[]
  loading: boolean
  selectedId: string | null
  onSelect: (document: DocumentItem) => void
  onDelete: (document: DocumentItem) => void
  sortBy: DocumentSortField
  sortDir: SortDirection
  onSort: (field: DocumentSortField) => void
  page: number
  totalPages: number
  total: number
  hasMore: boolean
  onPreviousPage: () => void
  onNextPage: () => void
}

const SORT_OPTIONS: Array<{ field: DocumentSortField; label: string }> = [
  { field: 'createdAt', label: 'Uploaded' },
  { field: 'title', label: 'Title' },
  { field: 'category', label: 'Category' },
  { field: 'sizeBytes', label: 'Size' },
]

export function DocumentList({
  items,
  loading,
  selectedId,
  onSelect,
  onDelete,
  sortBy,
  sortDir,
  onSort,
  page,
  totalPages,
  total,
  hasMore,
  onPreviousPage,
  onNextPage,
}: DocumentListProps) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-[0_1px_2px_rgba(26,46,90,0.04)]">
      <div className="shrink-0 space-y-3 border-b border-border-subtle px-4 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-navy">Library</h2>
          <p className="text-xs text-text-muted">
            {total === 0
              ? 'No documents yet'
              : `${total} document${total === 1 ? '' : 's'} · 10 per page`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {SORT_OPTIONS.map((option) => {
            const active = sortBy === option.field
            return (
              <button
                key={option.field}
                type="button"
                onClick={() => onSort(option.field)}
                className={cn(
                  'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition',
                  active
                    ? 'bg-navy text-white'
                    : 'bg-surface-muted text-text-secondary hover:bg-white hover:text-navy',
                )}
              >
                {option.label}
                {active ? (
                  sortDir === 'asc' ? (
                    <ArrowUp className="size-3" />
                  ) : (
                    <ArrowDown className="size-3" />
                  )
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-border-subtle p-3"
              >
                <Skeleton className="mb-2 h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <FileText className="size-8 text-text-muted" strokeWidth={1.5} />
            <p className="text-sm font-medium text-navy">No documents found</p>
            <p className="max-w-xs text-xs text-text-muted">
              Upload a PDF or clear filters to see files in this workspace.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {items.map((item) => {
              const isSelected = item.id === selectedId
              const caseLabel = item.caseTitle
                ? item.caseNumber
                  ? `${item.caseNumber} — ${item.caseTitle}`
                  : item.caseTitle
                : null

              return (
                <li key={item.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(item)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelect(item)
                      }
                    }}
                    className={cn(
                      'group relative flex w-full cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-left transition duration-150',
                      isSelected
                        ? 'border-blue/30 bg-blue-soft/70 shadow-[inset_3px_0_0_0_var(--color-blue)]'
                        : 'border-transparent hover:border-border-subtle hover:bg-surface-muted/70',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl transition',
                        isSelected
                          ? 'bg-blue text-white'
                          : 'bg-surface-muted text-text-muted group-hover:text-blue',
                      )}
                    >
                      <FileText className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-navy">
                            {item.title}
                          </p>
                          <p className="truncate text-xs text-text-muted">
                            {item.fileName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onDelete(item)
                          }}
                          className={cn(
                            'shrink-0 rounded-lg p-1.5 transition',
                            isSelected
                              ? 'bg-danger/10 text-danger hover:bg-danger/15'
                              : 'text-text-muted opacity-0 group-hover:opacity-100 hover:bg-danger/10 hover:text-danger',
                          )}
                          aria-label={`Delete ${item.title}`}
                          title="Delete document"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[11px] font-medium text-text-secondary ring-1 ring-border-subtle">
                          {DOCUMENT_CATEGORY_LABELS[item.category]}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {formatBytes(item.sizeBytes)}
                        </span>
                        <span className="text-[11px] text-text-muted">·</span>
                        <span className="text-[11px] text-text-muted">
                          {formatShortDate(item.createdAt)}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1">
                        <p className="flex min-w-0 items-center gap-1.5 text-xs text-text-secondary">
                          <Briefcase className="size-3 shrink-0 text-text-muted" />
                          <span className="truncate">
                            {caseLabel ?? 'Unlinked case'}
                          </span>
                        </p>
                        <p className="flex min-w-0 items-center gap-1.5 text-xs text-text-secondary">
                          <UserRound className="size-3 shrink-0 text-text-muted" />
                          <span className="truncate">
                            {item.clientName ?? 'Unlinked client'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {total > 0 ? (
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border-subtle px-3 py-2.5">
          <span className="text-xs text-text-muted">
            Page {page} of {Math.max(totalPages, 1)}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={onPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!hasMore || loading}
              onClick={onNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
