import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarX,
  Gavel,
} from 'lucide-react'

import { Card } from '@/shared/components/Card'
import { MetricCard } from '@/shared/components/MetricCard'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatCount } from '@/shared/lib/utils'

import type { HearingStatsSummary } from '../types'

interface HearingStatsProps {
  stats: HearingStatsSummary | null
  loading: boolean
}

const NO_VALUE = '—'

export function HearingStats({ stats, loading }: HearingStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="space-y-3 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
          </Card>
        ))}
      </div>
    )
  }

  const value = (input?: number) =>
    input === undefined ? NO_VALUE : formatCount(input)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        label="Total hearings"
        value={value(stats?.totalHearings)}
        icon={Gavel}
        hint={stats ? undefined : 'Available once the hearings API is connected'}
      />
      <MetricCard
        label="Today's"
        value={value(stats?.todayHearings)}
        icon={CalendarDays}
        tone={stats && stats.todayHearings > 0 ? 'warning' : 'default'}
      />
      <MetricCard
        label="Upcoming"
        value={value(stats?.upcomingHearings)}
        icon={CalendarClock}
      />
      <MetricCard
        label="Completed"
        value={value(stats?.completedHearings)}
        icon={CalendarCheck}
        tone="success"
      />
      <MetricCard
        label="Postponed"
        value={value(stats?.postponedHearings)}
        icon={CalendarX}
        tone={stats && stats.postponedHearings > 0 ? 'danger' : 'default'}
      />
    </div>
  )
}
