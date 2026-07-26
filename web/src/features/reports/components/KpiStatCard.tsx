import type { LucideIcon } from 'lucide-react'

import { Badge } from '@/shared/components/Badge'
import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'
import { cn, formatCount, formatMoney, formatPercent } from '@/shared/lib/utils'

import { Sparkline } from './charts/Sparkline'
import type { TrendValue } from '../types'

interface KpiStatCardProps {
  label: string
  trend: TrendValue | null
  icon?: LucideIcon
  money?: boolean
  currency?: string
  suffix?: string
  loading?: boolean
}

export function KpiStatCard({
  label,
  trend,
  icon: Icon,
  money,
  currency = 'USD',
  suffix,
  loading,
}: KpiStatCardProps) {
  if (loading) {
    return (
      <Card className="space-y-3 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="ml-auto h-6 w-16" />
      </Card>
    )
  }

  const display =
    trend == null
      ? '—'
      : money
        ? formatMoney(trend.value, currency)
        : `${formatCount(trend.value)}${suffix ?? ''}`

  const change = trend?.changePercent
  const changeTone =
    change == null ? 'neutral' : change >= 0 ? 'success' : 'danger'

  return (
    <Card className="relative overflow-hidden p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <Icon className="size-4 shrink-0 text-blue" strokeWidth={1.75} />
          ) : null}
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            {label}
          </p>
        </div>
        {change != null ? (
          <Badge variant={changeTone}>
            {change >= 0 ? '+' : ''}
            {formatPercent(change)}
          </Badge>
        ) : null}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="truncate font-display text-2xl text-navy">{display}</p>
        <Sparkline
          values={trend?.sparkline ?? []}
          className={cn('h-6 w-16 shrink-0 opacity-80')}
        />
      </div>
    </Card>
  )
}
