import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'

export function CaseListSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="divide-y divide-border-subtle">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="size-4 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="hidden h-4 w-32 md:block" />
            <Skeleton className="hidden h-6 w-24 rounded-full md:block" />
            <Skeleton className="hidden h-4 w-20 lg:block" />
          </div>
        ))}
      </div>
    </Card>
  )
}

export function CaseDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="space-y-3 p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Card className="space-y-4 p-5">
          <Skeleton className="h-4 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="space-y-3 p-4">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CaseFormSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="space-y-4 p-5">
            <Skeleton className="h-4 w-36" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((__, field) => (
                <Skeleton key={field} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          </Card>
        ))}
      </div>
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="space-y-4 p-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </Card>
        ))}
      </div>
    </div>
  )
}

export function HearingsSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-border-subtle">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="size-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </Card>
  )
}
