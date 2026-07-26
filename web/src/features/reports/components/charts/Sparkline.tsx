import { useMemo } from 'react'

import { getChartPalette } from '../../lib/chartTheme'

interface SparklineProps {
  values: number[]
  className?: string
}

/** Lightweight SVG sparkline — no chart library dependency for KPI cards. */
export function Sparkline({ values, className }: SparklineProps) {
  const palette = useMemo(() => getChartPalette(), [])
  const color = palette[1]

  if (values.length < 2) {
    return (
      <svg
        viewBox="0 0 64 24"
        className={className}
        aria-hidden
        role="presentation"
      >
        <line
          x1="0"
          y1="12"
          x2="64"
          y2="12"
          stroke={color}
          strokeOpacity="0.25"
          strokeWidth="2"
        />
      </svg>
    )
  }

  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = Math.max(max - min, 1)
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 64
      const y = 22 - ((value - min) / range) * 18
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox="0 0 64 24"
      className={className}
      aria-hidden
      role="presentation"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  )
}
