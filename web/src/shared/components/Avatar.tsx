import { cn, initials } from '@/shared/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name: string
  src?: string | null
  size?: AvatarSize
  /** Renders a small presence dot; omit for no indicator. */
  online?: boolean
  className?: string
}

const sizes: Record<AvatarSize, string> = {
  sm: 'size-8 text-[11px]',
  md: 'size-10 text-xs',
  lg: 'size-14 text-sm',
  xl: 'size-20 text-lg',
}

export function Avatar({
  name,
  src,
  size = 'md',
  online,
  className,
}: AvatarProps) {
  const label = initials(name) || '—'

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full border border-border-subtle object-cover',
            sizes[size],
          )}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-navy font-bold text-white',
            sizes[size],
          )}
        >
          {label}
        </span>
      )}
      {online !== undefined ? (
        <span
          className={cn(
            'absolute bottom-0 right-0 size-3 rounded-full border-2 border-white',
            online ? 'bg-success' : 'bg-text-muted',
          )}
        />
      ) : null}
      {!src ? <span className="sr-only">{name}</span> : null}
    </span>
  )
}
