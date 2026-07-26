import { Loader2, Search } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  /** Announced to screen readers, e.g. "Search clients". */
  ariaLabel: string
  /** Shows the spinner while a debounced request is in flight. */
  searching?: boolean
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  ariaLabel,
  searching = false,
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative min-w-56 flex-1', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          'h-9 w-full rounded-lg border border-border bg-white pl-9 pr-9 text-sm text-text outline-none transition',
          'placeholder:text-text-muted focus:border-blue focus:ring-4 focus:ring-blue/15',
        )}
      />
      {searching ? (
        <Loader2
          className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-text-muted"
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
}
