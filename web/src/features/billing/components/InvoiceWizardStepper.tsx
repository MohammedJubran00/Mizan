import { cn } from '@/shared/lib/utils'

interface InvoiceWizardStepperProps {
  step: 1 | 2
  onStepChange?: (step: 1 | 2) => void
}

const STEPS = [
  { id: 1 as const, label: 'General info' },
  { id: 2 as const, label: 'Invoice items' },
]

export function InvoiceWizardStepper({
  step,
  onStepChange,
}: InvoiceWizardStepperProps) {
  return (
    <nav aria-label="Invoice creation steps" className="mb-6">
      <ol className="flex items-center gap-3">
        {STEPS.map((entry, index) => {
          const active = step === entry.id
          const complete = step > entry.id

          return (
            <li key={entry.id} className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                disabled={!onStepChange || entry.id > step}
                onClick={() => onStepChange?.(entry.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15',
                  entry.id > step && 'cursor-default opacity-60',
                )}
              >
                <span
                  className={cn(
                    'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                    active || complete
                      ? 'bg-navy text-white'
                      : 'bg-surface-muted text-text-muted',
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  {entry.id}
                </span>
                <span
                  className={cn(
                    'truncate text-sm font-semibold',
                    active ? 'text-navy' : 'text-text-muted',
                  )}
                >
                  {entry.label}
                </span>
              </button>
              {index < STEPS.length - 1 ? (
                <div
                  className="h-px min-w-6 flex-1 bg-border"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
