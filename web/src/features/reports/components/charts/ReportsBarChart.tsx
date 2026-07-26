import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatCount, formatMoney } from '@/shared/lib/utils'

import { getChartPalette, getChartSurface } from '../../lib/chartTheme'
import type { ChartPoint } from '../../types'

interface ReportsBarChartProps {
  data: ChartPoint[]
  currency?: boolean
  currencyCode?: string
  layout?: 'horizontal' | 'vertical'
  stackedKey?: string
}

export function ReportsBarChart({
  data,
  currency,
  currencyCode = 'USD',
  layout = 'horizontal',
}: ReportsBarChartProps) {
  const palette = useMemo(() => getChartPalette(), [])
  const surface = useMemo(() => getChartSurface(), [])

  const chartData = data.map((point) => ({
    name: point.label,
    value: point.value,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout={layout === 'vertical' ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid stroke={surface.grid} vertical={false} />
        {layout === 'vertical' ? (
          <>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={88}
              tick={{ fill: surface.tick, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
          </>
        ) : (
          <>
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
          </>
        )}
        <Tooltip
          cursor={{ fill: surface.grid }}
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
        <Bar dataKey="value" fill={palette[1]} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
