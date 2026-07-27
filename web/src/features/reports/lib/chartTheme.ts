/**
 * Resolves chart palette from CSS design tokens so Recharts never needs
 * hardcoded hex values in feature code.
 */
export function readCssColor(variable: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
  return value || fallback
}

export function getChartPalette() {
  return [
    readCssColor('--color-navy', '#1a2e5a'),
    readCssColor('--color-blue', '#2f5bea'),
    readCssColor('--color-gold', '#d4af37'),
    readCssColor('--color-navy-muted', '#3d4f6f'),
    readCssColor('--color-text-muted', '#6b7c93'),
    readCssColor('--color-border', '#8b95a8'),
  ]
}

export function getChartSurface() {
  return {
    grid: readCssColor('--color-border-subtle', '#f0f1f3'),
    tick: readCssColor('--color-text-muted', '#9ca3af'),
    tooltipBg: readCssColor('--color-white', '#ffffff'),
    tooltipBorder: readCssColor('--color-border-subtle', '#e5e7eb'),
    tooltipText: readCssColor('--color-navy', '#1a2e5a'),
  }
}
