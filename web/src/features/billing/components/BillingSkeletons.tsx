import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'

export function BillingListSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>
      <div className="divide-y divide-border-subtle">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="hidden h-4 w-32 md:block" />
            <Skeleton className="hidden h-4 w-24 lg:block" />
            <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        ))}
      </div>
    </Card>
  )
}

export function InvoiceDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-5">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </Card>

      <Card className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="space-y-4 p-5">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </Card>
        <div className="space-y-4">
          <Card className="space-y-3 p-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-28" />
          </Card>
          <Card className="space-y-3 p-5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-16 w-full" />
          </Card>
        </div>
      </div>
    </div>
  )
}

export function InvoiceFormSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <Card className="space-y-4 p-5">
        <Skeleton className="h-4 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
        </div>
      </Card>
      <Card className="space-y-3 p-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-28" />
      </Card>
    </div>
  )
}

export function PaymentsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <Card className="space-y-4 p-8">
        <Skeleton className="mx-auto size-14 rounded-2xl" />
        <Skeleton className="mx-auto h-6 w-48" />
        <Skeleton className="mx-auto h-4 w-72" />
        <Skeleton className="mx-auto h-10 w-40" />
      </Card>
      <div className="space-y-4">
        <Card className="space-y-3 p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
        </Card>
        <Card className="space-y-3 p-5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-28" />
        </Card>
      </div>
    </div>
  )
}
