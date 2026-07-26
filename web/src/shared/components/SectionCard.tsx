import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card } from '@/shared/components/Card'
import { cn } from '@/shared/lib/utils'

interface SectionCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <Icon className="size-4 shrink-0 text-blue" strokeWidth={1.75} />
          ) : null}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-navy">{title}</h2>
            {description ? (
              <p className="truncate text-xs text-text-muted">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn('px-4 py-4', bodyClassName)}>{children}</div>
    </Card>
  )
}
