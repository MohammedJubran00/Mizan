import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card } from '@/shared/components/Card'
import { cn } from '@/shared/lib/utils'

export type MetricTone = 'default' | 'danger' | 'success' | 'warning'

interface MetricCardProps {
  label: string
  value: string
  icon?: LucideIcon
  tone?: MetricTone
  hint?: string
  /** Small control rendered in the top-right corner, e.g. a "View all" link. */
  action?: ReactNode
  className?: string
}

const valueTones: Record<MetricTone, string> = {
  default: 'text-navy',
  danger: 'text-danger',
  success: 'text-success',
  warning: 'text-warning',
}

const iconTones: Record<MetricTone, string> = {
  default: 'text-blue',
  danger: 'text-danger',
  success: 'text-success',
  warning: 'text-warning',
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  hint,
  action,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <Icon
              className={cn('size-4 shrink-0', iconTones[tone])}
              strokeWidth={1.75}
            />
          ) : null}
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            {label}
          </p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <p className={cn('mt-2 truncate font-display text-2xl', valueTones[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-1 truncate text-xs text-text-muted">{hint}</p> : null}
    </Card>
  )
}
