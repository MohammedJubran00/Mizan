import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useToastStore, type ToastVariant } from '@/stores/toastStore'
import { cn } from '@/shared/lib/utils'

const icons: Record<ToastVariant, LucideIcon> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const accents: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-blue',
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((item) => {
        const Icon = icons[item.variant]

        return (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto flex animate-fade-in items-start gap-3 rounded-xl border border-border-subtle bg-white px-4 py-3 shadow-lg"
          >
            <Icon className={cn('mt-0.5 size-4 shrink-0', accents[item.variant])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-navy">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                  {item.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-text-muted transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
