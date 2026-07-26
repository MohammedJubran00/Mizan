import { TrendingUp } from 'lucide-react'

import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { SectionCard } from '@/shared/components/SectionCard'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatMoney } from '@/shared/lib/utils'

import type { RevenueProjectionPoint } from '../types'

interface RevenueChartProps {
  points: RevenueProjectionPoint[]
  loading?: boolean
  currency?: string
}

/** Data-driven chart placeholder — renders an empty state until projection data exists. */
export function RevenueChart({
  points,
  loading,
  currency = 'USD',
}: RevenueChartProps) {
  return (
    <SectionCard
      title="Revenue projection"
      description="Estimated earnings based on current billables"
      icon={TrendingUp}
      action={
        <span className="rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-semibold text-text-secondary">
          Next 6 months
        </span>
      }
    >
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="flex justify-between gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-8" />
            ))}
          </div>
        </div>
      ) : points.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No projection yet"
          description="Revenue projections will appear here once invoices and billables are available."
          className="border-0 py-10"
        />
      ) : (
        <div className="space-y-4">
          <div className="flex h-40 items-end gap-2">
            {points.map((point) => {
              const max = Math.max(...points.map((entry) => entry.amount), 1)
              const height = `${Math.max((point.amount / max) * 100, 4)}%`
              return (
                <div
                  key={point.label}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full origin-bottom rounded-t-md bg-blue/80"
                    style={{ height }}
                    title={formatMoney(point.amount, currency)}
                    aria-label={`${point.label}: ${formatMoney(point.amount, currency)}`}
                  />
                  <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    {point.label}
                  </span>
                </div>
              )
            })}
          </div>
          <Card className="border-dashed bg-surface-muted/40 p-3 text-xs text-text-muted">
            Chart values are driven by the billing API. No sample data is shown.
          </Card>
        </div>
      )}
    </SectionCard>
  )
}
