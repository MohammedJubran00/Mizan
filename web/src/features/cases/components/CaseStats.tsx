import { Briefcase, CalendarClock, CheckCircle2, FolderOpen } from 'lucide-react'

import { Card } from '@/shared/components/Card'
import { MetricCard } from '@/shared/components/MetricCard'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatCount } from '@/shared/lib/utils'

import type { CaseStatsSummary } from '../types'

interface CaseStatsProps {
  stats: CaseStatsSummary | null
  loading: boolean
}

const NO_VALUE = '—'

export function CaseStats({ stats, loading }: CaseStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Total cases"
        value={value(stats?.totalCases)}
        icon={FolderOpen}
        hint={stats ? undefined : 'Available once the cases API is connected'}
      />
      <MetricCard label="Active cases" value={value(stats?.activeCases)} icon={Briefcase} />
      <MetricCard
        label="Closed cases"
        value={value(stats?.closedCases)}
        icon={CheckCircle2}
      />
      <MetricCard
        label="Upcoming hearings"
        value={value(stats?.upcomingHearings)}
        icon={CalendarClock}
      />
    </div>
  )
}
