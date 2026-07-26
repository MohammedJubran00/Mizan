import {
  Activity as ActivityIcon,
  Briefcase,
  CalendarCheck,
  FileText,
  ListFilter,
  Receipt,
  StickyNote,
  UserCog,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/shared/components/Badge'
import { DropdownMenu } from '@/shared/components/DropdownMenu'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatRelativeTime } from '@/shared/lib/utils'

import type { Activity, ActivityType } from '../types'

const activityIcons: Record<ActivityType, LucideIcon> = {
  CASE_CREATED: Briefcase,
  CASE_UPDATED: Briefcase,
  MEETING_SCHEDULED: CalendarCheck,
  DOCUMENT_UPLOADED: FileText,
  INVOICE_ISSUED: Receipt,
  PAYMENT_RECEIVED: Wallet,
  NOTE_ADDED: StickyNote,
  CLIENT_UPDATED: UserCog,
}

const activityLabels: Record<ActivityType, string> = {
  CASE_CREATED: 'Cases',
  CASE_UPDATED: 'Cases',
  MEETING_SCHEDULED: 'Meetings',
  DOCUMENT_UPLOADED: 'Documents',
  INVOICE_ISSUED: 'Invoices',
  PAYMENT_RECEIVED: 'Payments',
  NOTE_ADDED: 'Notes',
  CLIENT_UPDATED: 'Profile',
}

interface ActivityFeedProps {
  activities: Activity[]
  title?: string
  /** Renders a vertical connector between entries. */
  variant?: 'feed' | 'timeline'
}

export function ActivityFeed({
  activities,
  title = 'Activity Feed',
  variant = 'feed',
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityType | 'ALL'>('ALL')

  const availableTypes = useMemo(
    () => Array.from(new Set(activities.map((item) => item.type))),
    [activities],
  )

  const visible = useMemo(
    () =>
      (filter === 'ALL'
        ? activities
        : activities.filter((item) => item.type === filter)
      )
        .slice()
        .sort(
          (a, b) =>
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
        ),
    [activities, filter],
  )

  const filterItems = [
    {
      id: 'ALL',
      label: 'All activity',
      onSelect: () => setFilter('ALL'),
    },
    ...availableTypes.map((type) => ({
      id: type,
      label: activityLabels[type],
      icon: activityIcons[type],
      onSelect: () => setFilter(type),
    })),
  ]

  return (
    <SectionCard
      title={title}
      icon={ActivityIcon}
      action={
        availableTypes.length > 0 ? (
          <DropdownMenu
            triggerLabel="Filter activity"
            trigger={
              <span className="inline-flex items-center gap-1.5">
                <ListFilter className="size-4" />
                {filter === 'ALL' ? 'Filter' : activityLabels[filter]}
              </span>
            }
            items={filterItems}
          />
        ) : null
      }
    >
      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">
          {activities.length === 0
            ? 'No activity recorded for this client yet.'
            : 'No activity matches this filter.'}
        </p>
      ) : (
        <ol className="space-y-3">
          {visible.map((item, index) => {
            const Icon = activityIcons[item.type]
            const isLast = index === visible.length - 1

            return (
              <li key={item.id} className="relative flex gap-3">
                {variant === 'timeline' && !isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-9 h-[calc(100%-1rem)] w-px bg-border-subtle"
                  />
                ) : null}
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-soft text-blue">
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>

                <div className="min-w-0 flex-1 rounded-xl bg-surface-muted px-3.5 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-navy">{item.title}</p>
                    <time
                      dateTime={item.occurredAt}
                      className="text-xs text-text-muted"
                    >
                      {formatRelativeTime(item.occurredAt)}
                    </time>
                  </div>

                  {item.description ? (
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {item.description}
                    </p>
                  ) : null}

                  {item.actorName ? (
                    <p className="mt-1.5 text-xs text-text-muted">
                      {item.actorName}
                    </p>
                  ) : null}

                  {item.attachments && item.attachments.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {item.attachments.map((attachment) => (
                        <li
                          key={attachment.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-2 py-1 text-xs text-text-secondary"
                        >
                          <FileText className="size-3.5 text-blue" />
                          {attachment.fileName}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {item.caseReference || item.caseId ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {item.caseReference ? (
                        <Badge variant="neutral">{item.caseReference}</Badge>
                      ) : null}
                      {item.caseId ? (
                        <Link
                          to={`/cases/${item.caseId}`}
                          className="text-xs font-semibold text-blue transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30"
                        >
                          View case details
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </SectionCard>
  )
}
