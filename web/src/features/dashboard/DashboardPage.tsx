import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'

import { TopBar } from '@/app/layout/TopBar'
import { fetchDashboard } from '@/features/dashboard/api'
import { ActivityPanel } from '@/features/dashboard/components/ActivityPanel'
import { DashboardCharts } from '@/features/dashboard/components/DashboardCharts'
import { DeadlinesPanel } from '@/features/dashboard/components/DeadlinesPanel'
import { HearingsPanel } from '@/features/dashboard/components/HearingsPanel'
import { StatCard } from '@/features/dashboard/components/StatCard'
import type {
  ActivitiesDashboardDto,
  DashboardResponse,
  TimelineActivityDto,
} from '@/features/dashboard/types'
import { Button } from '@/shared/components/Button'
import { Skeleton } from '@/shared/components/Skeleton'
import {
  formatCount,
  formatDisplayDate,
  formatHours,
  formatMoney,
  formatPercent,
} from '@/shared/lib/utils'

function mergeActivities(
  base: ActivitiesDashboardDto,
  extra: ActivitiesDashboardDto,
): ActivitiesDashboardDto {
  const seen = new Set(base.items.map((item) => item.id))
  const appended = extra.items.filter((item) => !seen.has(item.id))
  const items = [...base.items, ...appended]

  const groupMap = new Map<string, { key: string; label: string; items: TimelineActivityDto[] }>()

  for (const group of [...base.groups, ...extra.groups]) {
    const existing = groupMap.get(group.key)
    if (!existing) {
      groupMap.set(group.key, {
        key: group.key,
        label: group.label,
        items: [...group.items],
      })
      continue
    }
    const ids = new Set(existing.items.map((item) => item.id))
    existing.items.push(...group.items.filter((item) => !ids.has(item.id)))
  }

  return {
    total: extra.total || base.total,
    items,
    groups: Array.from(groupMap.values()),
    pagination: extra.pagination,
  }
}

export function DashboardPage() {
  const [extraActivities, setExtraActivities] =
    useState<ActivitiesDashboardDto | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchDashboard({ activityPageSize: 20 }),
    refetchInterval: 60_000,
  })

  const data = useMemo(() => {
    if (!query.data) return null
    if (!extraActivities) return query.data
    return {
      ...query.data,
      activities: extraActivities,
    } satisfies DashboardResponse
  }, [query.data, extraActivities])

  async function handleRefresh() {
    setExtraActivities(null)
    await query.refetch()
  }

  async function handleLoadMore() {
    if (!data?.activities.pagination.hasMore || loadingMore) return
    setLoadingMore(true)
    try {
      const current = extraActivities ?? data.activities
      const nextPage = current.pagination.page + 1
      const more = await fetchDashboard({
        activityPage: nextPage,
        activityPageSize: current.pagination.pageSize || 20,
        activityCursor: current.pagination.nextCursor,
      })
      setExtraActivities(mergeActivities(current, more.activities))
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <>
      <TopBar
        title={data?.greeting.message ?? 'Dashboard'}
        subtitle={
          data
            ? formatDisplayDate(data.greeting.serverTime || data.generatedAt)
            : 'Loading your practice overview…'
        }
        notificationCount={data?.notifications.unreadNotifications ?? 0}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void handleRefresh()}
            loading={query.isFetching && !query.isLoading}
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        }
      />

      <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {query.isLoading ? <DashboardSkeleton /> : null}

        {query.isError ? (
          <div className="rounded-2xl border border-danger/20 bg-white p-8 text-center">
            <p className="font-display text-xl text-navy">
              Unable to load dashboard
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              {query.error instanceof Error
                ? query.error.message
                : 'Please try again.'}
            </p>
            <Button className="mt-5" onClick={() => void handleRefresh()}>
              Retry
            </Button>
          </div>
        ) : null}

        {data ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Active cases"
                value={formatCount(data.overview.activeCases.active)}
                trend={data.overview.activeCases.trendLabel}
                hint={`${formatCount(data.overview.activeCases.open)} open · ${formatCount(data.overview.activeCases.closed)} closed`}
                accent="navy"
              />
              <StatCard
                label="Revenue"
                value={formatMoney(
                  data.overview.revenue.totalPaid,
                  data.overview.revenue.currency,
                )}
                trend={data.overview.revenue.trendLabel}
                hint={`${formatCount(data.overview.revenue.paidInvoiceCount)} paid invoices`}
                accent="gold"
              />
              <StatCard
                label="Win rate"
                value={formatPercent(data.overview.winRate.winRate)}
                trend={data.overview.winRate.trendLabel}
                hint={`${formatCount(data.overview.winRate.won)} won · ${formatCount(data.overview.winRate.lost)} lost`}
                accent="success"
              />
              <StatCard
                label="Billable hours"
                value={formatHours(data.overview.billableHours.totalHours)}
                trend={data.overview.billableHours.trendLabel}
                hint={`${formatCount(data.overview.clients.active)} active clients`}
                accent="blue"
              />
            </section>

            <DashboardCharts
              charts={data.charts}
              caseMix={data.caseMix}
              revenue={data.revenue}
              team={data.team}
            />

            <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1.15fr]">
              <HearingsPanel hearings={data.hearings} />
              <DeadlinesPanel deadlines={data.deadlines} />
              <ActivityPanel
                activities={data.activities}
                loadingMore={loadingMore}
                onLoadMore={() => void handleLoadMore()}
              />
            </section>
          </>
        ) : null}
      </main>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-80" />
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  )
}
