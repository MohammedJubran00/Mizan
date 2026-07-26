import type { DragEvent } from 'react'

import { cn, formatTime } from '@/shared/lib/utils'

import { setEventDragPayload } from '../lib/dragTransfer'
import { categoryTones } from '../lib/labels'
import type { CalendarEventItem } from '../types'

interface EventChipProps {
  event: CalendarEventItem
  onOpen: (id: string) => void
  /** Enables HTML5 drag so the event can be moved to another day. */
  draggable?: boolean
  className?: string
}

/** Compact single-line representation used inside month cells. */
export function EventChip({
  event,
  onOpen,
  draggable = false,
  className,
}: EventChipProps) {
  const tone = categoryTones[event.category]

  function onDragStart(dragEvent: DragEvent<HTMLButtonElement>) {
    setEventDragPayload(dragEvent.dataTransfer, {
      id: event.id,
      startAt: event.startAt,
      endAt: event.endAt,
      grabOffsetMinutes: 0,
    })
  }

  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onClick={() => onOpen(event.id)}
      title={`${event.allDay ? 'All day' : formatTime(event.startAt)} · ${event.title}`}
      className={cn(
        'flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] font-medium transition',
        'hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/25',
        event.status === 'CANCELLED' && 'line-through opacity-60',
        tone.chip,
        draggable && 'cursor-grab active:cursor-grabbing',
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', tone.dot)} />
      {!event.allDay ? (
        <span className="shrink-0 tabular-nums opacity-80">
          {formatTime(event.startAt)}
        </span>
      ) : null}
      <span className="truncate">{event.title}</span>
    </button>
  )
}
