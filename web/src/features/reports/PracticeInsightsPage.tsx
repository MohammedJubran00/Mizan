import {
  AlertCircle,
  Briefcase,
  CalendarClock,
  Download,
  Filter,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Badge } from '@/shared/components/Badge'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { formatCount, formatMoney } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import { ChartContainer } from './components/ChartContainer'
import { ReportsAreaChart } from './components/charts/ReportsAreaChart'
import { ReportsBarChart } from './components/charts/ReportsBarChart'
import { ReportsLineChart } from './components/charts/ReportsLineChart'
import { DateRangePicker } from './components/DateRangePicker'
import { InsightsSkeleton } from './components/ReportsSkeletons'
import { ScheduleReportModal } from './components/ScheduleReportModal'
import {
  usePracticeInsights,
  useReportsMutations,
} from './hooks/useReportsQueries'
import type { ScheduleReportPayload } from './types'

export function PracticeInsightsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [scheduleOpen, setScheduleOpen] = useState(false)

  const query = useMemo(
    () => ({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [startDate, endDate],
  )

  const { insights, state, isLoading, refetch } = usePracticeInsights(query)
  const { scheduleReport, isScheduling } = useReportsMutations({
    onScheduled: () => setScheduleOpen(false),
  })

  const hasFilters = Boolean(startDate || endDate)

  function clearFilters() {
    setStartDate('')
    setEndDate('')
  }

  function handleSchedule(payload: ScheduleReportPayload) {
    scheduleReport.mutate({ reportId: 'insights', payload })
  }

  return (
    <>
      <TopBar
        title="Practice insights"
        subtitle="Deep-dive analytics for billables, growth, and resolution trends."
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setFiltersOpen((value) => !value)}
            >
              <Filter className="size-4" />
              Advanced filters
            </Button>
            <Button size="sm" onClick={() => setScheduleOpen(true)}>
              <CalendarClock className="size-4" />
              Schedule report
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Reports', to: '/reports' },
            { label: 'Analytics dashboard' },
          ]}
        />

        {filtersOpen ? (
          <Card className="p-4">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
          </Card>
        ) : null}

        {state === 'loading' ? <InsightsSkeleton /> : null}

        {state === 'error' ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load insights"
            description="Something went wrong while loading practice analytics."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : null}

        {state === 'empty' || state === 'ready' ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-6">
              <ChartContainer
                title="Billable hours trend"
                action={
                  insights?.periodLabel ? (
                    <Badge variant="neutral">{insights.periodLabel}</Badge>
                  ) : (
                    <Badge variant="neutral">Selected period</Badge>
                  )
                }
                loading={isLoading}
                empty={!insights?.billableHoursTrend.length}
                emptyTitle="No data available"
                emptyDescription="We couldn't find any billable hour records matching your current filter criteria. Try adjusting the date range or removing lawyer specific filters."
                onClearFilters={hasFilters ? clearFilters : undefined}
                heightClassName="h-80"
              >
                <ReportsBarChart data={insights?.billableHoursTrend ?? []} />
              </ChartContainer>

              <div className="grid gap-6 lg:grid-cols-2">
                <ChartContainer
                  title="Case resolution"
                  description="Average days to close over time"
                  loading={isLoading}
                  empty={!insights?.caseResolution.length}
                  emptyTitle="No resolution data"
                  emptyDescription="Resolution trends appear once closed cases are available."
                >
                  <ReportsLineChart data={insights?.caseResolution ?? []} />
                </ChartContainer>

                <ChartContainer
                  title="Client growth"
                  description="New clients over time"
                  loading={isLoading}
                  empty={!insights?.clientGrowth.length}
                  emptyTitle="No client growth series"
                  emptyDescription="Client growth charts stay empty until clients are added."
                >
                  <ReportsAreaChart data={insights?.clientGrowth ?? []} />
                </ChartContainer>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="flex items-center gap-3 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-blue-soft text-blue">
                  <Wallet className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    Total revenue
                  </p>
                  <p className="font-display text-2xl text-navy">
                    {insights?.totalRevenue == null
                      ? '—'
                      : formatMoney(
                          insights.totalRevenue,
                          insights.currency,
                        )}
                  </p>
                </div>
              </Card>

              <Card className="flex items-center gap-3 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-blue-soft text-blue">
                  <Briefcase className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    Active cases
                  </p>
                  <p className="font-display text-2xl text-navy">
                    {insights?.activeCases == null
                      ? '—'
                      : formatCount(insights.activeCases)}
                  </p>
                </div>
              </Card>

              <Card className="relative overflow-hidden bg-navy p-5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                  Premium insight
                </p>
                <h3 className="mt-2 font-display text-xl">
                  Practice area growth
                </h3>
                <p className="mt-2 text-sm text-white/80">
                  {(insights?.practiceAreaGrowth.length ?? 0) === 0
                    ? 'Growth by practice area will unlock when revenue analytics are connected.'
                    : 'Download a quarterly summary of practice area momentum.'}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-4 border-white/20 bg-white/10 text-white hover:bg-white/20"
                  onClick={() =>
                    toast.info(
                      'Summary unavailable',
                      'Quarterly downloads will be available once analytics data exists.',
                    )
                  }
                >
                  <Download className="size-4" />
                  Download quarterly summary
                </Button>
              </Card>

              <Card className="p-4 text-sm text-text-secondary">
                Looking for saved outputs?{' '}
                <Link
                  to="/reports/library"
                  className="font-semibold text-blue hover:underline"
                >
                  Open the report library
                </Link>
                .
              </Card>
            </div>
          </div>
        ) : null}
      </div>

      <ScheduleReportModal
        open={scheduleOpen}
        reportName="Practice insights"
        saving={isScheduling}
        onClose={() => setScheduleOpen(false)}
        onSave={handleSchedule}
      />
    </>
  )
}
