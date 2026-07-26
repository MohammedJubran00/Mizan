import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'

export function HearingListSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-border-subtle">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="size-4 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="hidden h-4 w-32 md:block" />
            <Skeleton className="hidden h-6 w-20 rounded-full lg:block" />
          </div>
        ))}
      </div>
    </Card>
  )
}

export function HearingDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-5">
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="space-y-3 p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-32" />
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Card className="space-y-4 p-5">
          <Skeleton className="h-4 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-3 p-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-16 w-full" />
        </Card>
      </div>
    </div>
  )
}

export function HearingFormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="space-y-4 p-5">
          <Skeleton className="h-4 w-36" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function HearingCalendarSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <Card className="space-y-4 p-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[28rem] w-full rounded-xl" />
      </Card>
      <div className="space-y-6">
        <Card className="space-y-3 p-4">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </Card>
        <Card className="space-y-3 p-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    </div>
  )
}
