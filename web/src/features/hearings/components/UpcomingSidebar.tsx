import { CalendarDays, Clock, MapPin, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatShortDate, formatTime } from '@/shared/lib/utils'

import type { CapacityInsight, HearingListItem } from '../types'

interface UpcomingSidebarProps {
  items: HearingListItem[]
}

export function UpcomingSidebar({ items }: UpcomingSidebarProps) {
  const navigate = useNavigate()

  return (
    <SectionCard
      title="Upcoming"
      icon={CalendarDays}
      action={<Badge variant="info">Next 7 days</Badge>}
    >
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-muted">
          No upcoming hearings in the next week.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const date = new Date(item.scheduledAt)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/hearings/${item.id}`)}
                  className="flex w-full gap-3 rounded-xl border border-border-subtle bg-surface-muted px-3 py-2.5 text-left transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
                >
                  <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-white text-navy">
                    <span className="text-[9px] font-bold uppercase leading-none">
                      {date.toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-sm font-bold leading-none">
                      {date.getDate()}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-navy">
                      {item.caseRef?.title ??
                        `Hearing · ${formatShortDate(item.scheduledAt)}`}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatTime(item.scheduledAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" />
                        {item.room ?? item.court ?? 'TBD'}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Button
        size="sm"
        variant="ghost"
        className="mt-3 w-full"
        onClick={() => navigate('/hearings')}
      >
        View full list
      </Button>
    </SectionCard>
  )
}

interface CapacityCardProps {
  capacity: CapacityInsight | null
}

export function CapacityCard({ capacity }: CapacityCardProps) {
  return (
    <Card className="bg-navy p-5 text-white">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
        Capacity insights
      </p>
      {capacity ? (
        <>
          <h3 className="mt-2 font-display text-xl">{capacity.headline}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            {capacity.description}
          </p>
          {capacity.trendPercent !== null && capacity.trendPercent !== undefined ? (
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gold">
              <TrendingUp className="size-3.5" />
              {capacity.trendPercent > 0 ? '+' : ''}
              {capacity.trendPercent}% vs last month
            </p>
          ) : null}
        </>
      ) : (
        <>
          <h3 className="mt-2 font-display text-xl">No capacity data yet</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            Workload insights will appear here once hearings are scheduled across
            your workspace.
          </p>
        </>
      )}
    </Card>
  )
}
