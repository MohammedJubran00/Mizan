import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: number | null | undefined, currency = 'USD') {
  const value = Number(amount ?? 0)
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(Number.isFinite(value) ? value : 0)
  } catch {
    return `${currency} ${(Number.isFinite(value) ? value : 0).toLocaleString()}`
  }
}

export function formatPercent(value: number | null | undefined) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '0%'
  if (Number.isInteger(n)) return `${n}%`
  return `${n.toFixed(1)}%`
}

export function formatHours(hours: number | null | undefined) {
  const n = Number(hours ?? 0)
  if (!Number.isFinite(n)) return '0h'
  if (Number.isInteger(n)) return `${n}h`
  return `${n.toFixed(1)}h`
}

export function formatCount(value: number | null | undefined) {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat().format(Math.round(Number.isFinite(n) ? n : 0))
}

export function formatDisplayDate(iso: string | Date) {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(iso: string | Date) {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatTime(iso: string | Date) {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatWeekday(iso: string | Date) {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`
}

export function formatShortDate(iso: string | Date) {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 1000 * 60 * 60 * 24 * 365],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['day', 1000 * 60 * 60 * 24],
  ['hour', 1000 * 60 * 60],
  ['minute', 1000 * 60],
]

export function formatRelativeTime(iso: string | Date) {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  const diff = date.getTime() - Date.now()
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= ms) {
      return formatter.format(Math.round(diff / ms), unit)
    }
  }

  return formatter.format(Math.round(diff / 1000), 'second')
}

export function initials(name: string | null | undefined) {
  const value = (name ?? '').trim()
  if (!value) return ''

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
