import { Loader2 } from 'lucide-react'

export function RouteFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-24 text-text-muted">
      <Loader2 className="size-5 animate-spin" />
      <span className="ml-2 text-sm">Loading…</span>
    </div>
  )
}
