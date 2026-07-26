import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, hint, className, id, required, ...props }, ref) {
    const inputId = id ?? props.name

    return (
      <label className="flex w-full flex-col gap-1.5">
        {label ? (
          <span className="text-sm font-medium text-text">
            {label}
            {required ? <span className="ml-0.5 text-danger">*</span> : null}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-11 w-full rounded-lg border bg-[#f3f4f6] px-3.5 text-sm text-text outline-none transition',
            'placeholder:text-text-muted focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/15',
            error ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-border',
            className,
          )}
          {...props}
        />
        {error ? <span className="text-xs text-danger">{error}</span> : null}
        {!error && hint ? (
          <span className="text-xs text-text-muted">{hint}</span>
        ) : null}
      </label>
    )
  },
)
