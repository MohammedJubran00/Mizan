import { cn } from '@/shared/lib/utils'

interface StatCardProps {
  label: string
  value: string
  trend?: string
  hint?: string
  accent?: 'navy' | 'blue' | 'gold' | 'success'
}

const accents = {
  navy: 'border-l-navy',
  blue: 'border-l-blue',
  gold: 'border-l-gold',
  success: 'border-l-success',
}

export function StatCard({
  label,
  value,
  trend,
  hint,
  accent = 'navy',
}: StatCardProps) {
  return (
    <article
      className={cn(
        'rounded-2xl border border-border-subtle bg-white p-5 shadow-[0_1px_2px_rgba(26,46,90,0.04)]',
        'border-l-4',
        accents[accent],
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl text-navy">{value}</p>
      {trend ? (
        <p className="mt-2 text-xs font-medium text-text-secondary">{trend}</p>
      ) : null}
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </article>
  )
}
