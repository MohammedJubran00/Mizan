import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatCount, formatMoney } from '@/shared/lib/utils'

import { getChartPalette, getChartSurface } from '../../lib/chartTheme'
import type { ChartPoint } from '../../types'

interface ReportsAreaChartProps {
  data: ChartPoint[]
  currency?: boolean
  currencyCode?: string
}

export function ReportsAreaChart({
  data,
  currency,
  currencyCode = 'USD',
}: ReportsAreaChartProps) {
  const palette = useMemo(() => getChartPalette(), [])
  const surface = useMemo(() => getChartSurface(), [])
  const gradientId = useMemo(
    () => `reports-area-${Math.random().toString(36).slice(2, 9)}`,
    [],
  )

  const chartData = data.map((point) => ({
    name: point.label,
    value: point.value,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette[1]} stopOpacity={0.28} />
            <stop offset="100%" stopColor={palette[1]} stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
        <Area
          type="monotone"
          dataKey="value"
          stroke={palette[1]}
          fill={`url(#${gradientId})`}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
