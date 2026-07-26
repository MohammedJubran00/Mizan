import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  /** Primary call to action rendered under the description. */
  action?: ReactNode
  /** Small pill under the content, e.g. "Coming soon". */
  badge?: string
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  badge,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-8 py-16 text-center',
        className,
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-soft text-blue">
        <Icon className="size-7" strokeWidth={1.75} />
      </div>
      <h2 className="font-display text-2xl text-navy">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
      {badge ? (
        <span className="mt-6 rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
          {badge}
        </span>
      ) : null}
    </div>
  )
}
