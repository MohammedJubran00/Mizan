import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatCount, formatMoney } from '@/shared/lib/utils'

import { getChartPalette, getChartSurface } from '../../lib/chartTheme'
import type { ChartPoint } from '../../types'

interface ReportsLineChartProps {
  data: ChartPoint[]
  currency?: boolean
  currencyCode?: string
}

export function ReportsLineChart({
  data,
  currency,
  currencyCode = 'USD',
}: ReportsLineChartProps) {
  const palette = useMemo(() => getChartPalette(), [])
  const surface = useMemo(() => getChartSurface(), [])

  const chartData = data.map((point) => ({
    name: point.label,
    value: point.value,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={surface.grid} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: surface.tick, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: surface.tick, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) =>
            currency ? formatMoney(value, currencyCode) : formatCount(value)
          }
        />
        <Tooltip
          contentStyle={{
            background: surface.tooltipBg,
            border: `1px solid ${surface.tooltipBorder}`,
            borderRadius: 12,
            color: surface.tooltipText,
          }}
          formatter={(value) => {
            const numeric = typeof value === 'number' ? value : Number(value)
            return currency
              ? formatMoney(numeric, currencyCode)
              : formatCount(numeric)
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={palette[1]}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
