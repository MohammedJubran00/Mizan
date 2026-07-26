import {
  AlertCircle,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileText,
  Filter,
  FolderOpen,
  GitCompare,
  Plus,
  Receipt,
  RefreshCw,
  Timer,
  Users,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { SectionCard } from '@/shared/components/SectionCard'
import { Select } from '@/shared/components/Select'
import { formatCount, formatDateTime, formatMoney } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import { ChartContainer } from './components/ChartContainer'
import { ReportsAreaChart } from './components/charts/ReportsAreaChart'
import { ReportsBarChart } from './components/charts/ReportsBarChart'
import { ReportsDonutChart } from './components/charts/ReportsDonutChart'
import { ReportsPieChart } from './components/charts/ReportsPieChart'
import { DateRangePicker } from './components/DateRangePicker'
import { KpiStatCard } from './components/KpiStatCard'
import { ReportsDashboardSkeleton } from './components/ReportsSkeletons'
import { ScheduleReportModal } from './components/ScheduleReportModal'
import { useReportsDashboard, useReportsMutations } from './hooks/useReportsQueries'
import type { ScheduleReportPayload } from './types'

export function ReportsDashboardPage() {
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [compare, setCompare] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [rangePreset, setRangePreset] = useState('12m')
  const [scheduleOpen, setScheduleOpen] = useState(false)

  const query = useMemo(
    () => ({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      compare,
    }),
    [startDate, endDate, compare],
  )

  const { dashboard, state, isLoading, refetch } = useReportsDashboard(query)
  const { scheduleReport, isScheduling } = useReportsMutations({
    onScheduled: () => setScheduleOpen(false),
  })

  const kpis = dashboard?.kpis ?? null
  const currency = dashboard?.currency ?? 'USD'

  function handleGenerate() {
    navigate('/reports/builder')
  }

  function handleExportAll() {
    toast.info(
      'Nothing to export',
      'Generate a report first, then export from the library or preview.',
    )
  }

  function handleSchedule(payload: ScheduleReportPayload) {
    scheduleReport.mutate({ reportId: 'dashboard', payload })
  }

  return (
    <>
      <TopBar
        title="Reports & Analytics"
        subtitle="Analyze firm performance across clients, cases, revenue, and documents."
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setFiltersOpen((value) => !value)}
            >
              <Filter className="size-4" />
              Filters
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCompare((value) => !value)}
              aria-pressed={compare}
            >
              <GitCompare className="size-4" />
              Compare period
            </Button>
            <Button size="sm" variant="secondary" onClick={handleExportAll}>
              Export
            </Button>
            <Button size="sm" onClick={handleGenerate}>
              <FileText className="size-4" />
              Generate report
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Link
              to="/reports/library"
              className="text-sm font-medium text-blue hover:underline"
            >
              Report library
            </Link>
            <span className="text-text-muted">·</span>
            <Link
              to="/reports/insights"
              className="text-sm font-medium text-blue hover:underline"
            >
              Practice insights
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <RefreshCw className="size-3.5" />
            <span>
              Last synced:{' '}
              {dashboard?.lastSyncedAt
                ? formatDateTime(dashboard.lastSyncedAt)
                : 'Not synced yet'}
            </span>
            <Button size="sm" variant="ghost" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </div>

        {filtersOpen ? (
          <Card className="grid gap-4 p-4 lg:grid-cols-[1fr_12rem]">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
            <Select
              label="Chart range"
              options={[
                { value: '12m', label: 'Last 12 months' },
                { value: '6m', label: 'Last 6 months' },
                { value: 'ytd', label: 'Year to date' },
              ]}
              value={rangePreset}
              onChange={(event) => setRangePreset(event.target.value)}
            />
          </Card>
        ) : null}

        {state === 'loading' ? <ReportsDashboardSkeleton /> : null}

        {state === 'error' ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load reports"
            description="Something went wrong while loading analytics. Please try again."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : null}

        {state === 'empty' || state === 'ready' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiStatCard
                label="Total clients"
                trend={kpis?.totalClients ?? null}
                icon={Users}
                loading={isLoading}
              />
              <KpiStatCard
                label="Active cases"
                trend={kpis?.activeCases ?? null}
                icon={Briefcase}
                loading={isLoading}
              />
              <KpiStatCard
                label="Closed cases"
                trend={kpis?.closedCases ?? null}
                icon={CheckCircle2}
                loading={isLoading}
              />
              <KpiStatCard
                label="Upcoming hearings"
                trend={kpis?.upcomingHearings ?? null}
                icon={CalendarClock}
                loading={isLoading}
              />
              <KpiStatCard
                label="Total revenue"
                trend={kpis?.totalRevenue ?? null}
                icon={Receipt}
                money
                currency={kpis?.totalRevenue?.currency ?? currency}
                loading={isLoading}
              />
              <KpiStatCard
                label="Outstanding balance"
                trend={kpis?.outstandingBalance ?? null}
                icon={Wallet}
                money
                currency={kpis?.outstandingBalance?.currency ?? currency}
                loading={isLoading}
              />
              <KpiStatCard
                label="Docs uploaded"
                trend={kpis?.documentsUploaded ?? null}
                icon={FolderOpen}
                loading={isLoading}
              />
              <KpiStatCard
                label="Avg resolution"
                trend={kpis?.averageResolutionDays ?? null}
                icon={Timer}
                suffix="d"
                loading={isLoading}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <ChartContainer
                title="Monthly revenue distribution"
                description="Net revenue after practice area splits"
                action={
                  <span className="rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-semibold text-text-secondary">
                    {rangePreset === '6m'
                      ? 'Last 6 months'
                      : rangePreset === 'ytd'
                        ? 'Year to date'
                        : 'Last 12 months'}
                  </span>
                }
                empty={!dashboard?.monthlyRevenue.length}
                emptyTitle="No revenue data"
                emptyDescription="Monthly revenue will appear here once billing data is available for the selected range."
              >
                <ReportsBarChart
                  data={dashboard?.monthlyRevenue ?? []}
                  currency
                  currencyCode={currency}
                />
              </ChartContainer>

              <ChartContainer
                title="Practice area revenue"
                description="Profitability by sector"
                empty={!dashboard?.practiceAreaRevenue.length}
                emptyTitle="No practice mix yet"
                emptyDescription="Practice area revenue splits will appear once invoices are linked to matters."
                heightClassName="h-72"
              >
                <ReportsDonutChart
                  data={dashboard?.practiceAreaRevenue ?? []}
                  currencyCode={currency}
                />
              </ChartContainer>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ChartContainer
                title="Revenue trend"
                description="Collected revenue over time"
                empty={!dashboard?.revenueTrend.length}
                emptyTitle="No trend series"
                emptyDescription="Revenue trend charts stay empty until payments are recorded."
              >
                <ReportsAreaChart
                  data={dashboard?.revenueTrend ?? []}
                  currency
                  currencyCode={currency}
                />
              </ChartContainer>

              <ChartContainer
                title="Case distribution"
                description="Open matters by status"
                empty={!dashboard?.caseDistribution.length}
                emptyTitle="No case distribution"
                emptyDescription="Case status distribution will appear when matters exist in the workspace."
              >
                <ReportsPieChart data={dashboard?.caseDistribution ?? []} />
              </ChartContainer>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <SectionCard title="Lawyer performance" className="xl:col-span-1">
                {(dashboard?.lawyerPerformance.length ?? 0) === 0 ? (
                  <p className="text-sm text-text-secondary">
                    Lawyer billables and revenue will appear here once time and
                    invoices are connected.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {dashboard?.lawyerPerformance.map((lawyer) => (
                      <li
                        key={lawyer.id}
                        className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-navy">
                            {lawyer.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatCount(lawyer.openCases)} open ·{' '}
                            {formatCount(lawyer.billableHours)}h
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-navy">
                          {formatMoney(lawyer.revenue, currency)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard title="Top clients">
                {(dashboard?.topClients.length ?? 0) === 0 ? (
                  <p className="text-sm text-text-secondary">
                    Top clients by revenue will appear once billing data exists.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {dashboard?.topClients.map((client) => (
                      <li
                        key={client.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-navy">
                            {client.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatCount(client.cases)} cases
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-navy">
                          {formatMoney(client.revenue, currency)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard
                title="Upcoming hearings"
                action={
                  <Link
                    to="/hearings"
                    className="text-xs font-semibold text-blue hover:underline"
                  >
                    View all
                  </Link>
                }
              >
                {(dashboard?.upcomingHearings.length ?? 0) === 0 ? (
                  <p className="text-sm text-text-secondary">
                    Upcoming hearings will appear here when scheduled.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {dashboard?.upcomingHearings.map((hearing) => (
                      <li key={hearing.id} className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy">
                          {hearing.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatDateTime(hearing.scheduledAt)}
                          {hearing.caseTitle ? ` · ${hearing.caseTitle}` : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>

            <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <h3 className="text-sm font-semibold text-navy">
                  Quick report actions
                </h3>
                <p className="mt-1 text-xs text-text-muted">
                  Build a custom report, browse saved reports, or schedule
                  delivery.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate('/reports/library')}
                >
                  Open library
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setScheduleOpen(true)}
                >
                  Schedule
                </Button>
                <Button size="sm" onClick={handleGenerate}>
                  <Plus className="size-4" />
                  New report
                </Button>
              </div>
            </Card>
          </>
        ) : null}
      </div>

      <ScheduleReportModal
        open={scheduleOpen}
        reportName="Dashboard snapshot"
        saving={isScheduling}
        onClose={() => setScheduleOpen(false)}
        onSave={handleSchedule}
      />

      <button
        type="button"
        aria-label="Create new report"
        onClick={handleGenerate}
        className="fixed bottom-6 right-6 z-20 inline-flex size-12 items-center justify-center rounded-full bg-navy text-white shadow-lg transition hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30"
      >
        <Plus className="size-5" />
      </button>
    </>
  )
}
