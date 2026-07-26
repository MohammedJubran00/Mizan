import {
  Briefcase,
  CalendarClock,
  CheckCircle2,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'

import { Card } from '@/shared/components/Card'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'
import { cn, formatShortDate, formatTime } from '@/shared/lib/utils'

import { categoryTones } from '../lib/labels'
import type { CalendarEventItem } from '../types'
import { CategoryBadge, EventStatusBadge, PriorityBadge } from './EventBadges'

interface EventCardProps {
  event: CalendarEventItem
  onOpen: (id: string) => void
  onEdit: (id: string) => void
  onReschedule: (event: CalendarEventItem) => void
  onComplete: (event: CalendarEventItem) => void
  onDelete: (event: CalendarEventItem) => void
  /** Shows the date next to the time, used outside single-day groupings. */
  showDate?: boolean
}

export function EventCard({
  event,
  onOpen,
  onEdit,
  onReschedule,
  onComplete,
  onDelete,
  showDate = false,
}: EventCardProps) {
  const menuItems: DropdownMenuItem[] = [
    { id: 'view', label: 'View details', icon: CalendarClock, onSelect: () => onOpen(event.id) },
    { id: 'edit', label: 'Edit event', icon: Pencil, onSelect: () => onEdit(event.id) },
    {
      id: 'reschedule',
      label: 'Reschedule',
      icon: CalendarClock,
      onSelect: () => onReschedule(event),
    },
    {
      id: 'complete',
      label: event.status === 'COMPLETED' ? 'Reopen event' : 'Mark complete',
      icon: CheckCircle2,
      onSelect: () => onComplete(event),
    },
    {
      id: 'delete',
      label: 'Delete event',
      icon: Trash2,
      tone: 'danger',
      onSelect: () => onDelete(event),
    },
  ]

  const meta = [
    event.client ? { icon: UserRound, label: event.client.fullName } : null,
    event.caseRef
      ? { icon: Briefcase, label: `${event.caseRef.caseNumber} — ${event.caseRef.title}` }
      : null,
    event.leadLawyer ? { icon: Users, label: event.leadLawyer.fullName } : null,
    event.location?.name ? { icon: MapPin, label: event.location.name } : null,
  ].filter((item): item is { icon: typeof UserRound; label: string } => item !== null)

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 p-4">
        <span
          aria-hidden="true"
          className={cn('w-1 shrink-0 rounded-full', categoryTones[event.category].dot)}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold tabular-nums text-navy">
              {event.allDay
                ? 'All day'
                : `${formatTime(event.startAt)} – ${formatTime(event.endAt)}`}
            </p>
            {showDate ? (
              <span className="text-xs text-text-muted">
                {formatShortDate(event.startAt)}
              </span>
            ) : null}
            <CategoryBadge category={event.category} />
            <PriorityBadge priority={event.priority} />
            <EventStatusBadge status={event.status} />
          </div>

          <button
            type="button"
            onClick={() => onOpen(event.id)}
            className="mt-1 block max-w-full truncate text-left text-base font-semibold text-navy transition hover:text-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
          >
            {event.title}
          </button>

          {meta.length > 0 ? (
            <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {meta.map((item) => (
                <li
                  key={item.label}
                  className="flex min-w-0 items-center gap-1.5 text-xs text-text-secondary"
                >
                  <item.icon className="size-3.5 shrink-0 text-text-muted" />
                  <span className="truncate">{item.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <DropdownMenu
          triggerLabel={`Actions for ${event.title}`}
          trigger={<MoreHorizontal className="size-4" />}
          items={menuItems}
        />
      </div>
    </Card>
  )
}
