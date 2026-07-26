import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, placeholder, className, id, required, ...props },
  ref,
) {
  const selectId = id ?? props.name

  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? (
        <span className="text-sm font-medium text-text">
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </span>
      ) : null}
      <span className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-11 w-full appearance-none rounded-lg border bg-[#f3f4f6] pl-3.5 pr-10 text-sm text-text outline-none transition',
            'focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/15',
            error
              ? 'border-danger focus:border-danger focus:ring-danger/15'
              : 'border-border',
            className,
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      </span>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
      {!error && hint ? (
        <span className="text-xs text-text-muted">{hint}</span>
      ) : null}
    </label>
  )
})
