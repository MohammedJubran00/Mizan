import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'

export function ReportsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="space-y-3 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="ml-auto h-6 w-16" />
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="space-y-3 p-5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </Card>
        <Card className="space-y-3 p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </Card>
      </div>
    </div>
  )
}

export function ReportLibrarySkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-border-subtle">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="hidden h-6 w-20 rounded-full md:block" />
            <Skeleton className="hidden h-4 w-24 lg:block" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        ))}
      </div>
    </Card>
  )
}

export function ReportBuilderSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <Card className="space-y-4 p-5">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </Card>
      <Card className="space-y-4 p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-64 w-full" />
      </Card>
    </div>
  )
}

export function InsightsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <Card className="space-y-4 p-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </Card>
      <div className="space-y-4">
        <Card className="space-y-3 p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-24" />
        </Card>
        <Card className="space-y-3 p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-16" />
        </Card>
        <Card className="h-40 p-4">
          <Skeleton className="h-full w-full rounded-xl" />
        </Card>
      </div>
    </div>
  )
}
