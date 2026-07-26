import { cn } from '@/shared/lib/utils'

interface ChoiceChipsProps<T extends string> {
  label: string
  value: T | ''
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
  error?: string
  required?: boolean
}

/** Radio group rendered as compact chips, for short option sets. */
export function ChoiceChips<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
  required,
}: ChoiceChipsProps<T>) {
  return (
    <fieldset className="flex w-full flex-col gap-2">
      <legend className="text-sm font-medium text-text">
        {label}
        {required ? <span className="ml-0.5 text-danger">*</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const isSelected = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15',
                isSelected
                  ? 'border-navy bg-navy text-white'
                  : 'border-border bg-white text-text-secondary hover:bg-surface-muted',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </fieldset>
  )
}
