import { MapPin } from 'lucide-react'

import type { HearingsDashboardDto } from '@/features/dashboard/types'
import { cn } from '@/shared/lib/utils'

const priorityStyles = {
  CRITICAL: 'bg-danger/10 text-danger',
  HIGH: 'bg-warning/10 text-warning',
  MEDIUM: 'bg-blue-soft text-blue',
  LOW: 'bg-surface-muted text-text-muted',
} as const

export function HearingsPanel({ hearings }: { hearings: HearingsDashboardDto }) {
  const items = hearings.hearings.slice(0, 8)

  return (
    <section className="rounded-2xl border border-border-subtle bg-white p-5 shadow-[0_1px_2px_rgba(26,46,90,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-navy">Upcoming hearings</h3>
          <p className="mt-1 text-xs text-text-muted">
            {hearings.todayCount} today · {hearings.upcomingCount} upcoming
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          No upcoming hearings.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((hearing) => (
            <li
              key={hearing.id}
              className="rounded-xl border border-border-subtle px-3.5 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">
                    {hearing.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-text-secondary">
                    {[hearing.caseNumber, hearing.clientName]
                      .filter(Boolean)
                      .join(' · ') || hearing.caseTitle}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                    priorityStyles[hearing.priority] ?? priorityStyles.MEDIUM,
                  )}
                >
                  {hearing.priority}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                <span>
                  {hearing.hearingDate}
                  {hearing.hearingTime ? ` · ${hearing.hearingTime}` : ''}
                </span>
                {hearing.location || hearing.courtName ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" />
                    {hearing.location || hearing.courtName}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
