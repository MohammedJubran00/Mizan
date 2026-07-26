import { useMemo, useState, type DragEvent } from 'react'

import { cn, formatTime } from '@/shared/lib/utils'

import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  MINUTES_PER_SLOT,
  PIXELS_PER_MINUTE,
  SLOT_HEIGHT_PX,
  addMinutes,
  dayKey,
  daySlots,
  groupByDay,
  gridStartOf,
  isSameDay,
  minutesBetween,
  weekDays,
} from '../lib/calendarDates'
import { hasEventDragPayload, readEventDragPayload } from '../lib/dragTransfer'
import type { CalendarEventItem } from '../types'
import { EventBlock } from './EventBlock'
import { EventChip } from './EventChip'

interface TimeGridProps {
  cursor: Date
  view: 'week' | 'day'
  events: CalendarEventItem[]
  onOpenEvent: (id: string) => void
  onCreateAt: (date: Date) => void
  onMoveEvent: (change: { id: string; startAt: string; endAt: string }) => void
  onSelectDay: (date: Date) => void
}

interface SlotTarget {
  dayIndex: number
  slotIndex: number
}

export function TimeGrid({
  cursor,
  view,
  events,
  onOpenEvent,
  onCreateAt,
  onMoveEvent,
  onSelectDay,
}: TimeGridProps) {
  const [dropTarget, setDropTarget] = useState<SlotTarget | null>(null)

  const days = useMemo(
    () => (view === 'day' ? [cursor] : weekDays(cursor)),
    [cursor, view],
  )
  const slots = useMemo(() => daySlots(), [])
  const eventsByDay = useMemo(() => groupByDay(events), [events])
  const now = new Date()

  function slotDate(day: Date, slotIndex: number) {
    const slot = slots[slotIndex]
    if (!slot) return null
    const date = new Date(day)
    date.setHours(slot.hour, slot.minute, 0, 0)
    return date
  }

  function onDrop(
    dragEvent: DragEvent<HTMLDivElement>,
    day: Date,
    slotIndex: number,
  ) {
    dragEvent.preventDefault()
    setDropTarget(null)

    const payload = readEventDragPayload(dragEvent.dataTransfer)
    const target = slotDate(day, slotIndex)
    if (!payload || !target) return

    const duration = Math.max(
      minutesBetween(new Date(payload.startAt), new Date(payload.endAt)),
      MINUTES_PER_SLOT,
    )

    if (target.getTime() === new Date(payload.startAt).getTime()) return

    onMoveEvent({
      id: payload.id,
      startAt: target.toISOString(),
      endAt: addMinutes(target, duration).toISOString(),
    })
  }

  const columnHeight = slots.length * SLOT_HEIGHT_PX

  return (
    <div className="overflow-x-auto">
      <div className={cn('min-w-[44rem]', view === 'day' && 'min-w-0')}>
        <div
          className="grid border-b border-border-subtle bg-surface-muted/60"
          style={{
            gridTemplateColumns: `4rem repeat(${days.length}, minmax(0, 1fr))`,
          }}
        >
          <div aria-hidden="true" />
          {days.map((day) => {
            const isToday = isSameDay(day, now)
            const allDay = (eventsByDay.get(dayKey(day)) ?? []).filter(
              (event) => event.allDay,
            )

            return (
              <div
                key={day.toISOString()}
                className="border-l border-border-subtle px-2 py-2"
              >
                <button
                  type="button"
                  onClick={() => onSelectDay(day)}
                  className="flex w-full flex-col items-center rounded-lg py-0.5 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    {day.toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold',
                      isToday ? 'bg-navy text-white' : 'text-navy',
                    )}
                  >
                    {day.getDate()}
                  </span>
                </button>

                {allDay.length > 0 ? (
                  <div className="mt-1.5 space-y-1">
                    {allDay.map((event) => (
                      <EventChip
                        key={event.id}
                        event={event}
                        draggable
                        onOpen={onOpenEvent}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: `4rem repeat(${days.length}, minmax(0, 1fr))`,
          }}
        >
          <div className="relative" style={{ height: columnHeight }}>
            {slots.map((slot, index) =>
              slot.label ? (
                <span
                  key={`${slot.hour}-${slot.minute}`}
                  className="absolute right-2 -translate-y-1/2 text-[11px] font-medium text-text-muted"
                  style={{ top: index * SLOT_HEIGHT_PX }}
                >
                  {slot.label}
                </span>
              ) : null,
            )}
          </div>

          {days.map((day, dayIndex) => {
            const timed = (eventsByDay.get(dayKey(day)) ?? []).filter(
              (event) => !event.allDay,
            )
            const showNowLine =
              isSameDay(day, now) &&
              now.getHours() >= DAY_START_HOUR &&
              now.getHours() <= DAY_END_HOUR

            return (
              <div
                key={day.toISOString()}
                className="relative border-l border-border-subtle"
                style={{ height: columnHeight }}
              >
                {slots.map((slot, slotIndex) => {
                  const isDropTarget =
                    dropTarget?.dayIndex === dayIndex &&
                    dropTarget?.slotIndex === slotIndex

                  return (
                    <div
                      key={`${slot.hour}-${slot.minute}`}
                      onDragOver={(dragEvent) => {
                        if (!hasEventDragPayload(dragEvent.dataTransfer)) return
                        dragEvent.preventDefault()
                        dragEvent.dataTransfer.dropEffect = 'move'
                        setDropTarget({ dayIndex, slotIndex })
                      }}
                      onDragLeave={() =>
                        setDropTarget((current) =>
                          current?.dayIndex === dayIndex &&
                          current?.slotIndex === slotIndex
                            ? null
                            : current,
                        )
                      }
                      onDrop={(dragEvent) => onDrop(dragEvent, day, slotIndex)}
                      onDoubleClick={() => {
                        const target = slotDate(day, slotIndex)
                        if (target) onCreateAt(target)
                      }}
                      style={{ height: SLOT_HEIGHT_PX }}
                      className={cn(
                        'border-b transition',
                        slot.minute === 0
                          ? 'border-border-subtle'
                          : 'border-border-subtle/50',
                        isDropTarget && 'bg-blue-soft',
                      )}
                    />
                  )
                })}

                {timed.map((event) => (
                  <EventBlock
                    key={event.id}
                    event={event}
                    day={day}
                    onOpen={onOpenEvent}
                    onMove={onMoveEvent}
                    onResize={onMoveEvent}
                  />
                ))}

                {showNowLine ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                    style={{
                      top: minutesBetween(gridStartOf(day), now) * PIXELS_PER_MINUTE,
                    }}
                  >
                    <span className="size-1.5 rounded-full bg-danger" />
                    <span className="h-px flex-1 bg-danger" />
                    <span className="sr-only">Current time {formatTime(now)}</span>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
