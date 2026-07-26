import { Navigate, useLocation } from 'react-router-dom'
import { Construction } from 'lucide-react'

import { TopBar } from '@/app/layout/TopBar'
import { getNavByPath } from '@/config/nav'
import { EmptyState } from '@/shared/components/EmptyState'

export function ComingSoonPage() {
  const location = useLocation()
  const destination = getNavByPath(location.pathname)

  if (!destination) {
    return <Navigate to="/dashboard" replace />
  }

  const Icon = destination.icon

  return (
    <>
      <TopBar title={destination.label} subtitle={destination.description} />
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 lg:px-8">
        <EmptyState
          icon={Icon ?? Construction}
          title={`${destination.label} is on the way`}
          description={destination.description}
          badge="Coming soon"
        />
      </div>
    </>
  )
}
