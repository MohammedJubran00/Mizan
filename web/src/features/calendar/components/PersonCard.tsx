import type { LucideIcon } from 'lucide-react'

import { Avatar } from '@/shared/components/Avatar'
import { Button } from '@/shared/components/Button'
import { SectionCard } from '@/shared/components/SectionCard'

import type { EventPersonRef } from '../types'

interface PersonCardProps {
  title: string
  icon: LucideIcon
  person: EventPersonRef | null
  emptyMessage: string
  actionLabel?: string
  onAction?: () => void
}

/** Compact person summary used for the client and lawyer sidebar cards. */
export function PersonCard({
  title,
  icon,
  person,
  emptyMessage,
  actionLabel,
  onAction,
}: PersonCardProps) {
  return (
    <SectionCard title={title} icon={icon}>
      {!person ? (
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar name={person.fullName} src={person.avatarUrl} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy">
                {person.fullName}
              </p>
              {person.subtitle ? (
                <p className="truncate text-xs text-text-muted">{person.subtitle}</p>
              ) : null}
            </div>
          </div>

          <dl className="space-y-1.5">
            {person.email ? (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-xs text-text-muted">Email</dt>
                <dd className="min-w-0">
                  <a
                    href={`mailto:${person.email}`}
                    className="block truncate text-xs text-blue transition hover:underline"
                  >
                    {person.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {person.phone ? (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-xs text-text-muted">Phone</dt>
                <dd className="min-w-0">
                  <a
                    href={`tel:${person.phone}`}
                    className="block truncate text-xs text-blue transition hover:underline"
                  >
                    {person.phone}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          {actionLabel && onAction ? (
            <Button size="sm" variant="secondary" className="w-full" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
      )}
    </SectionCard>
  )
}
