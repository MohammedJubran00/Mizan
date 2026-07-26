import { useRef, type KeyboardEvent } from 'react'

import { cn } from '@/shared/lib/utils'

export interface TabItem {
  id: string
  label: string
  /** Rendered next to the label when greater than zero. */
  count?: number
}

interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  /** Used to build stable aria-controls ids shared with the panel. */
  idPrefix: string
  ariaLabel?: string
  className?: string
}

export function Tabs({
  items,
  value,
  onChange,
  idPrefix,
  ariaLabel = 'Sections',
  className,
}: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null)

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = items.findIndex((item) => item.id === value)
    if (currentIndex === -1) return

    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % items.length
    if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + items.length) % items.length
    }
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = items.length - 1

    if (nextIndex === null) return

    event.preventDefault()
    const next = items[nextIndex]
    onChange(next.id)
    listRef.current
      ?.querySelector<HTMLButtonElement>(`#${idPrefix}-tab-${next.id}`)
      ?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        'flex gap-1 overflow-x-auto border-b border-border-subtle',
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.id === value
        return (
          <button
            key={item.id}
            id={`${idPrefix}-tab-${item.id}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${item.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative shrink-0 rounded-t-lg px-3.5 py-2.5 text-sm font-medium transition',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15',
              isActive
                ? 'text-navy after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-navy'
                : 'text-text-secondary hover:bg-surface-muted hover:text-navy',
            )}
          >
            {item.label}
            {item.count && item.count > 0 ? (
              <span className="ml-1.5 text-text-muted">({item.count})</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

interface TabPanelProps {
  id: string
  idPrefix: string
  active: boolean
  children: React.ReactNode
  className?: string
}

export function TabPanel({
  id,
  idPrefix,
  active,
  children,
  className,
}: TabPanelProps) {
  if (!active) return null

  return (
    <div
      id={`${idPrefix}-panel-${id}`}
      role="tabpanel"
      aria-labelledby={`${idPrefix}-tab-${id}`}
      tabIndex={0}
      className={cn('focus-visible:outline-none', className)}
    >
      {children}
    </div>
  )
}
