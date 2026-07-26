import type { LucideIcon } from 'lucide-react'

import { SectionCard } from '@/shared/components/SectionCard'
import { cn } from '@/shared/lib/utils'

export interface InfoItem {
  label: string
  value?: string | null
  /** Renders the value as a link when provided (mailto:, tel:, …). */
  href?: string
  /** Spans both columns in the two-column layout. */
  wide?: boolean
}

interface InfoCardProps {
  title: string
  icon?: LucideIcon
  items: InfoItem[]
  emptyLabel?: string
  /** Single column suits narrow sidebars; two columns suit wide panels. */
  columns?: 1 | 2
  action?: React.ReactNode
  className?: string
}

export function InfoCard({
  title,
  icon,
  items,
  emptyLabel = 'Not provided',
  columns = 1,
  action,
  className,
}: InfoCardProps) {
  return (
    <SectionCard
      title={title}
      icon={icon}
      action={action}
      className={className}
      bodyClassName="px-4 py-4"
    >
      <dl
        className={cn(
          'gap-x-6 gap-y-3.5',
          columns === 2 ? 'grid sm:grid-cols-2' : 'grid',
        )}
      >
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(item.wide && columns === 2 && 'sm:col-span-2')}
          >
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {item.label}
            </dt>
            <dd className="mt-0.5 whitespace-pre-line break-words text-sm text-text">
              {item.value ? (
                item.href ? (
                  <a
                    href={item.href}
                    className="text-blue transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30"
                  >
                    {item.value}
                  </a>
                ) : (
                  item.value
                )
              ) : (
                <span className="text-text-muted">{emptyLabel}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  )
}
