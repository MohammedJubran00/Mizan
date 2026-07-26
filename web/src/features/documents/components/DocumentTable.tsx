import { ArrowDown, ArrowUp, FileText, Trash2 } from 'lucide-react'

import {
  DOCUMENT_CATEGORY_LABELS,
  type DocumentItem,
  type DocumentSortField,
  type SortDirection,
} from '@/features/documents/types'
import { Skeleton } from '@/shared/components/Skeleton'
import { cn, formatBytes, formatShortDate } from '@/shared/lib/utils'

interface DocumentTableProps {
  items: DocumentItem[]
  loading: boolean
  selectedId: string | null
  onSelect: (document: DocumentItem) => void
  onDelete: (document: DocumentItem) => void
  sortBy: DocumentSortField
  sortDir: SortDirection
  onSort: (field: DocumentSortField) => void
}

const columns: Array<{
  field: DocumentSortField | null
  label: string
  className?: string
}> = [
  { field: 'title', label: 'Document' },
  { field: 'category', label: 'Category', className: 'w-36' },
  { field: null, label: 'Case / Client', className: 'w-56' },
  { field: 'sizeBytes', label: 'Size', className: 'w-24' },
  { field: 'createdAt', label: 'Uploaded', className: 'w-40' },
  { field: null, label: '', className: 'w-12' },
]

export function DocumentTable({
  items,
  loading,
  selectedId,
  onSelect,
  onDelete,
  sortBy,
  sortDir,
  onSort,
}: DocumentTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-subtle bg-surface-muted/60">
            {columns.map((column, index) => (
              <th
                key={`${column.label}-${index}`}
                scope="col"
                className={cn(
                  'px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted',
                  column.className,
                )}
              >
                {column.field ? (
                  <button
                    type="button"
                    onClick={() => onSort(column.field as DocumentSortField)}
                    className="inline-flex items-center gap-1 transition hover:text-navy"
                  >
                    {column.label}
                    {sortBy === column.field ? (
                      sortDir === 'asc' ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )
                    ) : null}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <tr key={index} className="border-b border-border-subtle">
                {columns.map((_, columnIndex) => (
                  <td key={columnIndex} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : items.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-16 text-center text-sm text-text-muted"
              >
                No documents match the current filters.
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const isSelected = item.id === selectedId
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={cn(
                    'cursor-pointer border-b border-border-subtle transition',
                    isSelected ? 'bg-blue-soft/60' : 'hover:bg-surface-muted/70',
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <FileText
                        className={cn(
                          'mt-0.5 size-4 shrink-0',
                          isSelected ? 'text-blue' : 'text-text-muted',
                        )}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-text">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          {item.fileName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary">
                      {DOCUMENT_CATEGORY_LABELS[item.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.caseTitle || item.clientName ? (
                      <div className="min-w-0">
                        <p className="truncate text-xs text-text">
                          {item.caseNumber
                            ? `${item.caseNumber} — ${item.caseTitle}`
                            : item.caseTitle}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          {item.clientName}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted">Unlinked</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {formatBytes(item.sizeBytes)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-text-secondary">
                      {formatShortDate(item.createdAt)}
                    </p>
                    {item.uploadedBy ? (
                      <p className="truncate text-xs text-text-muted">
                        {item.uploadedBy.fullName}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDelete(item)
                      }}
                      className="rounded-lg p-1.5 text-text-muted transition hover:bg-danger/10 hover:text-danger"
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
