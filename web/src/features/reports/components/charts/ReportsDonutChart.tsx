import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { formatMoney, formatPercent } from '@/shared/lib/utils'

import { getChartPalette, getChartSurface } from '../../lib/chartTheme'
import type { NamedAmount } from '../../types'

interface ReportsDonutChartProps {
  data: NamedAmount[]
  currencyCode?: string
  centerLabel?: string
  centerValue?: string
}

export function ReportsDonutChart({
  data,
  currencyCode = 'USD',
  centerLabel = 'Total',
  centerValue,
}: ReportsDonutChartProps) {
  const palette = useMemo(() => getChartPalette(), [])
  const surface = useMemo(() => getChartSurface(), [])

  const chartData = data.map((item) => ({
    name: item.label,
    value: item.amount,
    percentage: item.percentage,
  }))

  const total = data.reduce((sum, item) => sum + item.amount, 0)
  const displayTotal =
    centerValue ?? formatMoney(total, data[0]?.currency ?? currencyCode)

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={palette[index % palette.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: surface.tooltipBg,
                border: `1px solid ${surface.tooltipBorder}`,
                borderRadius: 12,
                color: surface.tooltipText,
              }}
              formatter={(value, _name, item) => {
                const numeric = typeof value === 'number' ? value : Number(value)
                const percentage = item?.payload?.percentage
                return [
                  formatMoney(numeric, currencyCode),
                  percentage != null ? formatPercent(percentage) : undefined,
                ]
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            {centerLabel}
          </p>
          <p className="font-display text-xl text-navy">{displayTotal}</p>
        </div>
      </div>

          <ul className="mt-3 space-y-2">
        {data.map((item, index) => (
          <li
            key={item.label}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={
                  [
                    'size-2.5 shrink-0 rounded-full',
                    'bg-navy',
                    'bg-blue',
                    'bg-gold',
                    'bg-navy-muted',
                    'bg-text-muted',
                    'bg-border',
                  ][index % 6]
                }
                aria-hidden
              />
              <span className="truncate text-text-secondary">{item.label}</span>
            </span>
            <span className="shrink-0 font-semibold text-navy">
              {item.percentage != null
                ? formatPercent(item.percentage)
                : formatMoney(item.amount, item.currency ?? currencyCode)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
