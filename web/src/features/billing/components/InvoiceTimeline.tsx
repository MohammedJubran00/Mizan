import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { formatDateTime } from '@/shared/lib/utils'
import { History } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

import type { InvoiceTimelineEvent } from '../types'

interface InvoiceTimelineProps {
  events: InvoiceTimelineEvent[]
}

export function InvoiceTimeline({ events }: InvoiceTimelineProps) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold text-navy">Invoice timeline</h2>

      {events.length === 0 ? (
        <EmptyState
          icon={History}
          title="No timeline events"
          description="Status changes and deliveries will appear here as the invoice progresses."
          className="border-0 py-8"
        />
      ) : (
        <ol className="space-y-4">
          {events.map((event, index) => {
            const isLast = index === events.length - 1
            return (
              <li key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'mt-1 size-2.5 rounded-full',
                      isLast ? 'bg-blue' : 'bg-navy',
                    )}
                  />
                  {!isLast ? (
                    <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                  ) : null}
                </div>
                <div className="min-w-0 pb-2">
                  <p className="text-sm font-semibold text-navy">{event.title}</p>
                  {event.description ? (
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {event.description}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-text-muted">
                    {formatDateTime(event.occurredAt)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </Card>
  )
}
