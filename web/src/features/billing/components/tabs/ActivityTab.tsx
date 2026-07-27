import { Activity } from 'lucide-react'

import { EmptyState } from '@/shared/components/EmptyState'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatDateTime } from '@/shared/lib/utils'

import type { InvoiceActivity } from '../../types'

interface ActivityTabProps {
  activities: InvoiceActivity[]
}

export function ActivityTab({ activities }: ActivityTabProps) {
  return (
    <SectionCard title="Activity" icon={Activity}>
      {activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Sends, views, payments, and status changes will appear in this feed."
          className="border-0 py-10"
        />
      ) : (
        <ul className="space-y-4">
          {activities.map((item) => (
            <li
              key={item.id}
              className="border-b border-border-subtle pb-4 last:border-0 last:pb-0"
            >
              <p className="text-sm font-semibold text-navy">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-sm text-text-secondary">
                  {item.description}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-text-muted">
                {item.actorName ? `${item.actorName} · ` : ''}
                {formatDateTime(item.occurredAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
