import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'

import { navSections } from '@/config/nav'
import { cn, initials } from '@/shared/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

export function Sidebar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const workspace = useAuthStore((s) => s.workspace)
  const clearSession = useAuthStore((s) => s.clearSession)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen)
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  function logout() {
    clearSession()
    setMobileNavOpen(false)
    navigate('/login', { replace: true })
  }

  const content = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex items-center border-b border-sidebar-border px-4 py-5',
          collapsed ? 'justify-center' : 'justify-between gap-3',
        )}
      >
        {!collapsed ? (
          <div className="min-w-0">
            <p className="font-display text-2xl font-bold tracking-tight text-white">
              Mizan
            </p>
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
              {workspace?.name ?? 'Workspace'}
            </p>
          </div>
        ) : (
          <span className="font-display text-xl font-bold text-white">M</span>
        )}
        <button
          type="button"
          className="hidden rounded-lg p-2 text-sidebar-muted transition hover:bg-sidebar-surface hover:text-white lg:inline-flex"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
        <button
          type="button"
          className="inline-flex rounded-lg p-2 text-sidebar-muted transition hover:bg-sidebar-surface hover:text-white lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close navigation"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.id} className="mb-5">
            {!collapsed ? (
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted">
                {section.title}
              </p>
            ) : null}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                          collapsed && 'justify-center px-2',
                          isActive
                            ? 'bg-sidebar-active text-white shadow-[inset_3px_0_0_0_var(--color-gold)]'
                            : 'text-sidebar-muted hover:bg-sidebar-surface hover:text-sidebar-text',
                        )
                      }
                    >
                      <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                      {!collapsed ? (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badgeLabel ? (
                            <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-gold-light">
                              {item.badgeLabel}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed && workspace ? (
          <div className="mb-3 rounded-xl bg-sidebar-surface px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sidebar-muted">
              Role
            </p>
            <p className="mt-0.5 text-sm font-medium text-sidebar-text">
              {workspace.role}
            </p>
          </div>
        ) : null}

        <div
          className={cn(
            'flex items-center gap-3 rounded-xl px-2 py-2',
            collapsed && 'justify-center',
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue text-xs font-bold text-white">
            {initials(user?.fullName ?? 'U')}
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-sidebar-text">
                {user?.fullName}
              </p>
              <p className="truncate text-xs text-sidebar-muted">{user?.email}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={logout}
            className="rounded-lg p-2 text-sidebar-muted transition hover:bg-sidebar-surface hover:text-white"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside
        className={cn(
          'hidden h-dvh shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:block print:hidden',
          collapsed ? 'w-[72px]' : 'w-[260px]',
        )}
      >
        {content}
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-navy-deep/50 backdrop-blur-[2px]"
            aria-label="Close navigation overlay"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-sidebar shadow-2xl">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  )
}
