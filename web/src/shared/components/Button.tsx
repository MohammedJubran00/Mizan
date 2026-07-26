import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variants = {
  primary:
    'bg-navy text-white hover:bg-navy-deep focus-visible:ring-navy/30 shadow-sm',
  secondary:
    'bg-white text-navy border border-border hover:bg-surface-muted focus-visible:ring-navy/20',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text focus-visible:ring-navy/15',
  danger:
    'bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/30',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-55',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
      {children}
    </button>
  )
}
