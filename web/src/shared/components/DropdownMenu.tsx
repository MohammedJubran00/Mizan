import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

export interface DropdownMenuItem {
  id: string
  label: string
  icon?: LucideIcon
  tone?: 'default' | 'danger'
  disabled?: boolean
  onSelect: () => void
}

interface DropdownMenuProps {
  /** Visual content of the trigger button. */
  trigger: ReactNode
  triggerLabel: string
  items: DropdownMenuItem[]
  align?: 'start' | 'end'
  triggerClassName?: string
}

export function DropdownMenu({
  trigger,
  triggerLabel,
  items,
  align = 'end',
  triggerClassName,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    const options = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    )
    if (options.length === 0) return

    event.preventDefault()
    const currentIndex = options.indexOf(document.activeElement as HTMLElement)
    const delta = event.key === 'ArrowDown' ? 1 : -1
    const nextIndex =
      (currentIndex + delta + options.length) % options.length
    options[nextIndex]?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-border bg-white px-2.5 text-sm font-medium text-text-secondary transition',
          'hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15',
          triggerClassName,
        )}
      >
        {trigger}
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={triggerLabel}
          onKeyDown={onMenuKeyDown}
          className={cn(
            'absolute z-30 mt-1 min-w-52 overflow-hidden rounded-xl border border-border-subtle bg-white py-1 shadow-lg',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                role="menuitem"
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false)
                  item.onSelect()
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition',
                  'focus-visible:outline-none disabled:opacity-50',
                  item.tone === 'danger'
                    ? 'text-danger hover:bg-danger/10 focus:bg-danger/10'
                    : 'text-text-secondary hover:bg-surface-muted focus:bg-surface-muted',
                )}
              >
                {Icon ? <Icon className="size-4 shrink-0" /> : null}
                {item.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
