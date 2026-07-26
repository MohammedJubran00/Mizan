import { Bell, Menu, Moon, Sun } from 'lucide-react'

import { cn, initials } from '@/shared/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

interface TopBarProps {
  title?: string
  subtitle?: string
  notificationCount?: number
  actions?: React.ReactNode
  className?: string
}

export function TopBar({
  title,
  subtitle,
  notificationCount = 0,
  actions,
  className,
}: TopBarProps) {
  const user = useAuthStore((s) => s.user)
  const workspace = useAuthStore((s) => s.workspace)
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen)

  return (
    <header
      className={cn(
        'sticky top-0 z-20 border-b border-border-subtle bg-white/90 backdrop-blur-md print:hidden',
        className,
      )}
    >
      <div className="flex items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <button
          type="button"
          className="inline-flex rounded-lg border border-border p-2 text-text-secondary transition hover:bg-surface-muted lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </button>

        <div className="min-w-0 flex-1">
          {title ? (
            <>
              <h1 className="truncate font-display text-xl text-navy sm:text-2xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="truncate text-sm text-text-secondary">{subtitle}</p>
              ) : null}
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-soft px-2.5 py-1 text-xs font-semibold text-blue">
                {workspace?.name ?? 'Workspace'}
              </span>
              <span className="text-xs text-text-muted">{workspace?.role}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {actions}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-border p-2 text-text-secondary transition hover:bg-surface-muted"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )}
          </button>
          <button
            type="button"
            className="relative rounded-lg border border-border p-2 text-text-secondary transition hover:bg-surface-muted"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {notificationCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            ) : null}
          </button>
          <div className="ml-1 hidden items-center gap-2 sm:flex">
            <div className="flex size-9 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
              {initials(user?.fullName ?? 'U')}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
