import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'

export function ClientListSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-border-subtle">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </Card>
  )
}

export function ClientDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="space-y-3 p-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="space-y-3 p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-16" />
              </Card>
            ))}
          </div>
          <Card className="space-y-4 p-4">
            <Skeleton className="h-4 w-40" />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-xl" />
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}

export function ClientFormSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="space-y-4 p-5">
            <Skeleton className="h-4 w-32" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((__, field) => (
                <Skeleton key={field} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Card className="space-y-4 p-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </Card>
    </div>
  )
}
