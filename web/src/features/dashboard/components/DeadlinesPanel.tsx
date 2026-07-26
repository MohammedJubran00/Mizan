import type { DeadlinesDashboardDto } from '@/features/dashboard/types'
import { cn } from '@/shared/lib/utils'

const priorityStyles = {
  CRITICAL: 'border-l-danger',
  HIGH: 'border-l-warning',
  MEDIUM: 'border-l-blue',
  LOW: 'border-l-border',
} as const

export function DeadlinesPanel({ deadlines }: { deadlines: DeadlinesDashboardDto }) {
  const items = deadlines.deadlines.slice(0, 8)

  return (
    <section className="rounded-2xl border border-border-subtle bg-white p-5 shadow-[0_1px_2px_rgba(26,46,90,0.04)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-navy">Deadlines</h3>
        <p className="mt-1 text-xs text-text-muted">
          {deadlines.summary.dueToday} due today · {deadlines.summary.overdue}{' '}
          overdue
        </p>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          No upcoming deadlines.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((deadline) => (
            <li
              key={deadline.id}
              className={cn(
                'rounded-xl border border-border-subtle border-l-4 px-3.5 py-3',
                priorityStyles[deadline.priority] ?? priorityStyles.MEDIUM,
              )}
            >
              <p className="text-sm font-semibold text-text">{deadline.title}</p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {[deadline.caseNumber, deadline.caseTitle]
                  .filter(Boolean)
                  .join(' · ') || deadline.type}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                <span>
                  {deadline.dueDate}
                  {deadline.dueTime ? ` · ${deadline.dueTime}` : ''}
                </span>
                <span className="font-medium">
                  {deadline.daysRemaining < 0
                    ? `${Math.abs(deadline.daysRemaining)}d overdue`
                    : deadline.daysRemaining === 0
                      ? 'Due today'
                      : `${deadline.daysRemaining}d left`}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
