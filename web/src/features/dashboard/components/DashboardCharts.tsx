import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { CaseMixDto, ChartsDto, RevenueDashboardDto, TeamDto } from '@/features/dashboard/types'
import { formatMoney, formatPercent } from '@/shared/lib/utils'

const CHART_COLORS = ['#1A2E5A', '#2F5BEA', '#D4AF37', '#3D4F6F', '#6B7C93', '#8B95A8']

interface DashboardChartsProps {
  charts: ChartsDto
  caseMix: CaseMixDto
  revenue: RevenueDashboardDto
  team: TeamDto
}

function Panel({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-2xl border border-border-subtle bg-white p-5 shadow-[0_1px_2px_rgba(26,46,90,0.04)] ${className ?? ''}`}
    >
      <h3 className="mb-4 text-sm font-semibold text-navy">{title}</h3>
      {children}
    </section>
  )
}

export function DashboardCharts({
  charts,
  caseMix,
  revenue,
  team,
}: DashboardChartsProps) {
  const revenueTrend =
    revenue.byMonth?.length > 0
      ? revenue.byMonth
      : charts.revenueByMonth.map((point) => ({
          month: point.month,
          amount: point.amount,
        }))

  const statusData =
    caseMix.byStatus.length > 0
      ? caseMix.byStatus
      : charts.casesByStatus.map((point) => ({
          label: point.label,
          value: point.value,
          percentage: point.percentage ?? 0,
        }))

  const practiceData =
    caseMix.byPracticeArea.length > 0
      ? caseMix.byPracticeArea
      : charts.caseMixByPracticeArea.map((point) => ({
          label: point.label,
          value: point.value,
          percentage: point.percentage ?? 0,
        }))

  const roleData = Object.entries(team.roles.byRole ?? {}).map(([label, value]) => ({
    label,
    value,
  }))

  const growthItems = [
    { label: 'WoW', value: revenue.growth.weekOverWeek },
    { label: 'MoM', value: revenue.growth.monthOverMonth },
    { label: 'QoQ', value: revenue.growth.quarterOverQuarter },
    { label: 'YoY', value: revenue.growth.yearOverYear },
  ]

  const breakdown = revenue.breakdown?.items ?? [
    { key: 'paid', label: 'Paid', amount: revenue.paid, percentage: 0, currency: revenue.currency },
    {
      key: 'outstanding',
      label: 'Outstanding',
      amount: revenue.outstanding,
      percentage: 0,
      currency: revenue.currency,
    },
    { key: 'draft', label: 'Draft', amount: revenue.draft, percentage: 0, currency: revenue.currency },
  ]

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title="Revenue trend" className="xl:col-span-2">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2F5BEA" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#2F5BEA" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F0F1F3" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                formatter={(value) =>
                  formatMoney(Number(value ?? 0), revenue.currency)
                }
                contentStyle={{
                  borderRadius: 12,
                  borderColor: '#E5E7EB',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#2F5BEA"
                strokeWidth={2.5}
                fill="url(#revenueFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {growthItems.map((item) => (
            <span
              key={item.label}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                item.value >= 0
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              }`}
            >
              {item.label} {item.value >= 0 ? '+' : ''}
              {formatPercent(item.value)}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="Cases by status">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid stroke="#F0F1F3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  borderColor: '#E5E7EB',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Case mix by practice area">
        <div className="flex h-56 items-center gap-4">
          <div className="h-full min-w-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={practiceData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {practiceData.map((entry, index) => (
                    <Cell
                      key={entry.label}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: '#E5E7EB',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="hidden w-36 shrink-0 space-y-2 sm:block">
            {practiceData.slice(0, 5).map((item, index) => (
              <li key={item.label} className="flex items-center gap-2 text-xs">
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    background: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
                <span className="truncate text-text-secondary">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel title="Revenue breakdown">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakdown} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid stroke="#F0F1F3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={90}
                tick={{ fill: '#666666', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) =>
                  formatMoney(Number(value ?? 0), revenue.currency)
                }
                contentStyle={{
                  borderRadius: 12,
                  borderColor: '#E5E7EB',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                {breakdown.map((entry, index) => (
                  <Cell
                    key={entry.key ?? entry.label}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Team performance">
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-text-muted">Members</p>
            <p className="text-lg font-semibold text-navy">{team.memberCount}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Avg cases</p>
            <p className="text-lg font-semibold text-navy">
              {team.averageCasesPerLawyer.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Win rate</p>
            <p className="text-lg font-semibold text-navy">
              {formatPercent(team.averageWinRate)}
            </p>
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roleData.length ? roleData : [{ label: '—', value: 0 }]}>
              <XAxis
                dataKey="label"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  borderColor: '#E5E7EB',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" fill="#1A2E5A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  )
}
