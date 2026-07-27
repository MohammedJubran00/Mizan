import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { formatCount, formatMoney, formatPercent } from '@/shared/lib/utils'

import { getChartPalette, getChartSurface } from '../../lib/chartTheme'
import type { NamedAmount } from '../../types'

interface ReportsPieChartProps {
  data: NamedAmount[]
  currency?: boolean
  currencyCode?: string
}

export function ReportsPieChart({
  data,
  currency,
  currencyCode = 'USD',
}: ReportsPieChartProps) {
  const palette = useMemo(() => getChartPalette(), [])
  const surface = useMemo(() => getChartSurface(), [])

  const chartData = data.map((item) => ({
    name: item.label,
    value: item.amount,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius="88%"
          paddingAngle={2}
        >
          {chartData.map((entry, index) => (
            <Cell key={entry.name} fill={palette[index % palette.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: surface.tooltipBg,
            border: `1px solid ${surface.tooltipBorder}`,
            borderRadius: 12,
            color: surface.tooltipText,
          }}
          formatter={(value, name) => {
            const numeric = typeof value === 'number' ? value : Number(value)
            const total = data.reduce((sum, item) => sum + item.amount, 0)
            const pct = total > 0 ? (numeric / total) * 100 : 0
            return [
              currency
                ? formatMoney(numeric, currencyCode)
                : formatCount(numeric),
              `${name} (${formatPercent(pct)})`,
            ]
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
