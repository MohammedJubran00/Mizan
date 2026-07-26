import {
  CalendarClock,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Printer,
  RotateCcw,
  Trash2,
} from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'
import { formatDateTime, formatShortDate, formatTime } from '@/shared/lib/utils'

import type { EventDetails } from '../types'
import { CategoryBadge, EventStatusBadge, PriorityBadge } from './EventBadges'

interface EventHeaderProps {
  event: EventDetails
  onEdit: () => void
  onReschedule: () => void
  onToggleCompletion: () => void
  onPrint: () => void
  onDelete: () => void
}

export function EventHeader({
  event,
  onEdit,
  onReschedule,
  onToggleCompletion,
  onPrint,
  onDelete,
}: EventHeaderProps) {
  const isComplete = event.status === 'COMPLETED'

  const menuItems: DropdownMenuItem[] = [
    {
      id: 'reschedule',
      label: 'Reschedule',
      icon: CalendarClock,
      onSelect: onReschedule,
    },
    { id: 'print', label: 'Print', icon: Printer, onSelect: onPrint },
    {
      id: 'delete',
      label: 'Delete event',
      icon: Trash2,
      tone: 'danger',
      onSelect: onDelete,
    },
  ]

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl text-navy sm:text-3xl">
              {event.title}
            </h2>
            <CategoryBadge category={event.category} />
            <EventStatusBadge status={event.status} />
            <PriorityBadge priority={event.priority} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-text-secondary">
            <span>
              {formatShortDate(event.startAt)}
              {event.allDay
                ? ' · All day'
                : ` · ${formatTime(event.startAt)} – ${formatTime(event.endAt)}`}
            </span>
            {event.location?.name ? <span>{event.location.name}</span> : null}
            {event.caseRef ? <span>{event.caseRef.caseNumber}</span> : null}
            {event.completion ? (
              <span className="text-success">
                Completed {formatDateTime(event.completion.completedAt)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onToggleCompletion}>
            {isComplete ? (
              <>
                <RotateCcw className="size-4" />
                Reopen
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Mark Complete
              </>
            )}
          </Button>
          <Button size="sm" onClick={onEdit}>
            <Pencil className="size-4" />
            Edit Event
          </Button>
          <DropdownMenu
            triggerLabel="More event actions"
            trigger={<MoreHorizontal className="size-4" />}
            items={menuItems}
          />
        </div>
      </div>
    </Card>
  )
}
