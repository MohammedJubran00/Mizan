import { BarChart3 } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/Skeleton'
import { cn } from '@/shared/lib/utils'

interface ChartContainerProps {
  title: string
  description?: string
  action?: ReactNode
  loading?: boolean
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  onClearFilters?: () => void
  className?: string
  children: ReactNode
  heightClassName?: string
}

export function ChartContainer({
  title,
  description,
  action,
  loading,
  empty,
  emptyTitle = 'No data available',
  emptyDescription = 'There is no data matching the current filters yet.',
  onClearFilters,
  className,
  children,
  heightClassName = 'h-64',
}: ChartContainerProps) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-navy">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-text-muted">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {loading ? (
        <div className={cn('space-y-3', heightClassName)}>
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      ) : empty ? (
        <EmptyState
          icon={BarChart3}
          title={emptyTitle}
          description={emptyDescription}
          action={
            onClearFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="text-sm font-semibold text-blue hover:underline"
              >
                Clear all filters
              </button>
            ) : undefined
          }
          className="border-0 py-10"
        />
      ) : (
        <div className={heightClassName}>{children}</div>
      )}
    </Card>
  )
}
