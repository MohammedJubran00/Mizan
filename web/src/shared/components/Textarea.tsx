import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, hint, className, id, required, ...props },
    ref,
  ) {
    const textareaId = id ?? props.name

    return (
      <label className="flex w-full flex-col gap-1.5">
        {label ? (
          <span className="text-sm font-medium text-text">
            {label}
            {required ? <span className="ml-0.5 text-danger">*</span> : null}
          </span>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(
            'w-full resize-y rounded-lg border bg-[#f3f4f6] px-3.5 py-2.5 text-sm leading-relaxed text-text outline-none transition',
            'placeholder:text-text-muted focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/15',
            error
              ? 'border-danger focus:border-danger focus:ring-danger/15'
              : 'border-border',
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
