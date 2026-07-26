import {
  Ban,
  CheckCircle2,
  Clock3,
  UserRound,
  Wifi,
} from 'lucide-react'

import { Card } from '@/shared/components/Card'
import { MetricCard } from '@/shared/components/MetricCard'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatCount } from '@/shared/lib/utils'

import type { UsersSummary } from '../types'

interface UsersStatsProps {
  summary: UsersSummary | null
  loading: boolean
}

const NO_VALUE = '—'

export function UsersStats({ summary, loading }: UsersStatsProps) {
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

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        label="Total users"
        value={summary ? formatCount(summary.totalUsers) : NO_VALUE}
        icon={UserRound}
        hint={
          summary?.totalTrendThisMonth != null
            ? `+${formatCount(summary.totalTrendThisMonth)} this month`
            : summary
              ? undefined
              : 'Available once users API is connected'
        }
      />
      <MetricCard
        label="Active"
        value={summary ? formatCount(summary.activeUsers) : NO_VALUE}
        icon={CheckCircle2}
        tone="success"
      />
      <MetricCard
        label="Pending"
        value={summary ? formatCount(summary.pendingInvitations) : NO_VALUE}
        icon={Clock3}
        hint="Awaiting invite"
        tone="warning"
      />
      <MetricCard
        label="Suspended"
        value={summary ? formatCount(summary.suspendedUsers) : NO_VALUE}
        icon={Ban}
        tone={
          summary && summary.suspendedUsers > 0 ? 'danger' : 'default'
        }
      />
      <Card className="bg-navy p-4 text-white">
        <div className="flex items-center gap-2">
          <Wifi className="size-4 text-white/80" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
            Online now
          </p>
        </div>
        <p className="mt-2 font-display text-2xl">
          {summary ? formatCount(summary.onlineNow) : NO_VALUE}
        </p>
      </Card>
    </div>
  )
}
