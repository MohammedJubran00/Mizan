import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

export interface DataTableColumn<T> {
  id: string
  header: ReactNode
  /** Applied to both the header cell and body cells. */
  className?: string
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  caption: string
  empty: ReactNode
  onRowClick?: (row: T) => void
  /** Extra classes per row, e.g. to highlight selection. */
  rowClassName?: (row: T) => string | undefined
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  empty,
  onRowClick,
  rowClassName,
  className,
}: DataTableProps<T>) {
  if (rows.length === 0) return <>{empty}</>

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border-subtle">
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  'px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onRowClick(row)
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              className={cn(
                'transition',
                onRowClick &&
                  'cursor-pointer hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy/20',
                rowClassName?.(row),
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn('px-3 py-3 align-middle text-text', column.className)}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
