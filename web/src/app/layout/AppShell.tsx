import { Outlet } from 'react-router-dom'

import { Sidebar } from '@/app/layout/Sidebar'

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-surface-muted">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
