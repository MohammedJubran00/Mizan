import { useState, type DragEvent, type KeyboardEvent, type PointerEvent } from 'react'

import { cn, formatTime } from '@/shared/lib/utils'

import {
  PIXELS_PER_MINUTE,
  addMinutes,
  blockGeometry,
  snapMinutes,
} from '../lib/calendarDates'
import { setEventDragPayload } from '../lib/dragTransfer'
import { categoryTones } from '../lib/labels'
import type { CalendarEventItem } from '../types'

const KEYBOARD_STEP_MINUTES = 15

interface EventBlockProps {
  event: CalendarEventItem
  /** Column day, used to place the block inside the visible time window. */
  day: Date
  onOpen: (id: string) => void
  onMove: (change: { id: string; startAt: string; endAt: string }) => void
  onResize: (change: { id: string; startAt: string; endAt: string }) => void
}

/** Absolutely positioned event inside a time grid column. Drag to move, drag the bottom edge to resize. */
export function EventBlock({ event, day, onOpen, onMove, onResize }: EventBlockProps) {
  const [previewMinutes, setPreviewMinutes] = useState<number | null>(null)

  const geometry = blockGeometry(event, day)
  const tone = categoryTones[event.category]
  const durationMinutes = previewMinutes ?? geometry.durationMinutes
  const height = Math.max(durationMinutes * PIXELS_PER_MINUTE, 22)

  function commitDuration(minutes: number) {
    const start = new Date(event.startAt)
    onResize({
      id: event.id,
      startAt: event.startAt,
      endAt: addMinutes(start, minutes).toISOString(),
    })
  }

  function shiftStart(deltaMinutes: number) {
    const start = addMinutes(new Date(event.startAt), deltaMinutes)
    onMove({
      id: event.id,
      startAt: start.toISOString(),
      endAt: addMinutes(start, geometry.durationMinutes).toISOString(),
    })
  }

  function onDragStart(dragEvent: DragEvent<HTMLDivElement>) {
    setEventDragPayload(dragEvent.dataTransfer, {
      id: event.id,
      startAt: event.startAt,
      endAt: event.endAt,
      grabOffsetMinutes: 0,
    })
  }

  function onHandlePointerDown(pointerEvent: PointerEvent<HTMLSpanElement>) {
    pointerEvent.preventDefault()
    pointerEvent.stopPropagation()

    const originY = pointerEvent.clientY
    const baseMinutes = geometry.durationMinutes

    function nextMinutes(clientY: number) {
      return snapMinutes(baseMinutes + (clientY - originY) / PIXELS_PER_MINUTE)
    }

    function onPointerMove(moveEvent: globalThis.PointerEvent) {
      setPreviewMinutes(nextMinutes(moveEvent.clientY))
    }

    function onPointerUp(upEvent: globalThis.PointerEvent) {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)

      const minutes = nextMinutes(upEvent.clientY)
      setPreviewMinutes(null)
      if (minutes !== baseMinutes) commitDuration(minutes)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  function onKeyDown(keyEvent: KeyboardEvent<HTMLDivElement>) {
    if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
      keyEvent.preventDefault()
      onOpen(event.id)
      return
    }

    if (keyEvent.key !== 'ArrowUp' && keyEvent.key !== 'ArrowDown') return
    const direction = keyEvent.key === 'ArrowDown' ? 1 : -1

    // Alt resizes the duration, Shift moves the whole block.
    if (keyEvent.altKey) {
      keyEvent.preventDefault()
      commitDuration(
        snapMinutes(
          geometry.durationMinutes + direction * KEYBOARD_STEP_MINUTES,
          KEYBOARD_STEP_MINUTES,
        ),
      )
      return
    }

    if (keyEvent.shiftKey) {
      keyEvent.preventDefault()
      shiftStart(direction * KEYBOARD_STEP_MINUTES)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onClick={() => onOpen(event.id)}
      onKeyDown={onKeyDown}
      aria-label={`${event.title}, ${formatTime(event.startAt)} to ${formatTime(
        event.endAt,
      )}. Press Enter to open, Shift with arrow keys to move, Alt with arrow keys to resize.`}
      style={{ top: geometry.top, height }}
      className={cn(
        'absolute inset-x-1 z-10 cursor-grab overflow-hidden rounded-lg border-l-4 px-2 py-1 text-left shadow-sm transition',
        'active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30',
        tone.chip,
        tone.accent,
        event.status === 'CANCELLED' && 'opacity-60',
        previewMinutes !== null && 'ring-2 ring-blue/40',
      )}
    >
      <p className="truncate text-[11px] font-semibold">{event.title}</p>
      <p className="truncate text-[10px] opacity-80">
        {formatTime(event.startAt)} –{' '}
        {formatTime(addMinutes(new Date(event.startAt), durationMinutes))}
      </p>
      {event.location?.name ? (
        <p className="truncate text-[10px] opacity-70">{event.location.name}</p>
      ) : null}

      <span
        role="separator"
        aria-hidden="true"
        onPointerDown={onHandlePointerDown}
        className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize rounded-b-lg hover:bg-navy/10"
      />
    </div>
  )
}
