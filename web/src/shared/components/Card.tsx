import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/lib/utils'

/** Base surface used by every panel in the app. */
export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-subtle bg-white shadow-[0_1px_2px_rgba(26,46,90,0.04)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
