import { forwardRef, useEffect, useRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  indeterminate?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, indeterminate = false, className, ...props }, ref) {
    const innerRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      const node = innerRef.current
      if (node) node.indeterminate = indeterminate
    }, [indeterminate])

    const input = (
      <input
        ref={(node) => {
          innerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        type="checkbox"
        className={cn(
          'size-4 shrink-0 cursor-pointer rounded border-border accent-navy transition',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )

    if (!label) return input

    return (
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
        {input}
        {label}
      </label>
    )
  },
)
