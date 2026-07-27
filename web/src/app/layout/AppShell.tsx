import { Outlet } from 'react-router-dom'

import { Sidebar } from '@/app/layout/Sidebar'

/**
 * Professional dashboard chrome:
 * - Sidebar stays fixed for the viewport height
 * - Main column scrolls independently (pages keep TopBar sticky)
 */
export function AppShell() {
  return (
    <div className="flex h-dvh overflow-hidden bg-surface-muted">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
