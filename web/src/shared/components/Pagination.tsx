import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn, formatCount } from '@/shared/lib/utils'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/** Builds a compact page list with ellipsis markers, e.g. 1 … 4 5 6 … 16. */
function buildPages(page: number, totalPages: number): Array<number | 'gap'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, page])
  for (const offset of [-1, 1]) {
    const candidate = page + offset
    if (candidate > 1 && candidate < totalPages) pages.add(candidate)
  }

  const sorted = Array.from(pages).sort((a, b) => a - b)
  const result: Array<number | 'gap'> = []

  sorted.forEach((value, index) => {
    if (index > 0 && value - (sorted[index - 1] ?? 0) > 1) result.push('gap')
    result.push(value)
  })

  return result
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (total === 0) return null

  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)
  const pages = buildPages(page, Math.max(totalPages, 1))

  const buttonClass =
    'inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-lg border border-border bg-white px-2 text-xs font-semibold text-text-secondary transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15 disabled:pointer-events-none disabled:opacity-50'

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-4 py-3',
        className,
      )}
    >
      <p className="text-xs text-text-muted">
        Showing {formatCount(first)}–{formatCount(last)} of {formatCount(total)}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={buttonClass}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-3.5" />
          Previous
        </button>

        {pages.map((entry, index) =>
          entry === 'gap' ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-1 text-xs text-text-muted"
            >
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? 'page' : undefined}
              aria-label={`Page ${entry}`}
              className={cn(
                buttonClass,
                entry === page && 'border-navy bg-navy text-white hover:bg-navy-deep',
              )}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          className={buttonClass}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </nav>
  )
}
