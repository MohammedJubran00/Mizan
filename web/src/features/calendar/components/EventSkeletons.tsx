import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'

export function CalendarBoardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-4 py-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="ml-auto h-9 w-64" />
      </div>
      <div className="grid grid-cols-7 gap-px bg-border-subtle p-px">
        {Array.from({ length: 35 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-none" />
        ))}
      </div>
    </Card>
  )
}

export function AgendaSkeleton() {
  return (
    <div className="space-y-3 px-4 py-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  )
}

export function CalendarSidebarSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  )
}

export function EventDetailsSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  )
}

export function EventFormSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-56 w-full" />
      ))}
    </div>
  )
}
