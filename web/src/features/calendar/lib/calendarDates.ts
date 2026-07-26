import type { CalendarEventItem, CalendarViewMode } from '../types'

export const MINUTES_PER_SLOT = 30
export const DAY_START_HOUR = 7
export const DAY_END_HOUR = 20

export function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function endOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}

export function startOfWeek(date: Date) {
  const next = startOfDay(date)
  return addDays(next, -next.getDay())
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function dayKey(date: Date | string) {
  const value = typeof date === 'string' ? new Date(date) : date
  return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`
}

export function isSameDay(a: Date | string, b: Date | string) {
  return dayKey(a) === dayKey(b)
}

/** Six-week matrix covering the month, always starting on the locale week start. */
export function monthMatrix(cursor: Date) {
  const first = startOfMonth(cursor)
  const start = addDays(startOfDay(first), -first.getDay())
  return Array.from({ length: 42 }, (_, index) => addDays(start, index))
}

export function weekDays(cursor: Date) {
  const start = startOfWeek(cursor)
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function weekdayLabels() {
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
  // 2023-01-01 was a Sunday, which keeps the sequence stable across locales.
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(2023, 0, 1 + index)),
  )
}

/** Half-hour slots rendered by the week and day time grids. */
export function daySlots() {
  const slots: Array<{ hour: number; minute: number; label: string | null }> = []

  for (let hour = DAY_START_HOUR; hour <= DAY_END_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += MINUTES_PER_SLOT) {
      slots.push({
        hour,
        minute,
        label:
          minute === 0
            ? new Intl.DateTimeFormat(undefined, {
                hour: 'numeric',
              }).format(new Date(2023, 0, 1, hour))
            : null,
      })
    }
  }

  return slots
}

export function rangeFor(cursor: Date, view: CalendarViewMode) {
  if (view === 'day') {
    return { from: startOfDay(cursor), to: endOfDay(cursor) }
  }

  if (view === 'week') {
    const start = startOfWeek(cursor)
    return { from: start, to: endOfDay(addDays(start, 6)) }
  }

  if (view === 'agenda') {
    const start = startOfDay(cursor)
    return { from: start, to: endOfDay(addDays(start, 60)) }
  }

  // The month grid always shows leading and trailing days from adjacent months.
  const cells = monthMatrix(cursor)
  return {
    from: startOfDay(cells[0] ?? startOfMonth(cursor)),
    to: endOfDay(cells[cells.length - 1] ?? endOfMonth(cursor)),
  }
}

export function viewTitle(cursor: Date, view: CalendarViewMode) {
  if (view === 'day') {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(cursor)
  }

  if (view === 'week') {
    const start = startOfWeek(cursor)
    const end = addDays(start, 6)
    const startLabel = start.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    const endLabel = end.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return `${startLabel} – ${endLabel}`
  }

  if (view === 'agenda') return 'Agenda'

  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(cursor)
}

export function shiftCursor(
  cursor: Date,
  view: CalendarViewMode,
  direction: 1 | -1,
) {
  if (view === 'day') return addDays(cursor, direction)
  if (view === 'week') return addDays(cursor, direction * 7)
  if (view === 'agenda') return addDays(cursor, direction * 7)
  return new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1)
}

export function groupByDay(events: CalendarEventItem[]) {
  const map = new Map<string, CalendarEventItem[]>()

  for (const event of events) {
    const key = dayKey(event.startAt)
    map.set(key, [...(map.get(key) ?? []), event])
  }

  for (const [key, list] of map) {
    map.set(
      key,
      [...list].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      ),
    )
  }

  return map
}

export interface AgendaSection {
  id: string
  label: string
  events: CalendarEventItem[]
}

/** Buckets events into the agenda groups shown in the agenda view. */
export function buildAgendaSections(
  events: CalendarEventItem[],
  reference = new Date(),
): AgendaSection[] {
  const today = startOfDay(reference)
  const tomorrow = addDays(today, 1)
  const dayAfterTomorrow = addDays(today, 2)
  const endOfThisWeek = endOfDay(addDays(startOfWeek(today), 6))

  const buckets: Record<string, CalendarEventItem[]> = {
    earlier: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    upcoming: [],
  }

  for (const event of events) {
    const start = new Date(event.startAt)

    if (start < today) buckets.earlier!.push(event)
    else if (isSameDay(start, today)) buckets.today!.push(event)
    else if (isSameDay(start, tomorrow)) buckets.tomorrow!.push(event)
    else if (start >= dayAfterTomorrow && start <= endOfThisWeek) {
      buckets.thisWeek!.push(event)
    } else buckets.upcoming!.push(event)
  }

  const byStart = (a: CalendarEventItem, b: CalendarEventItem) =>
    new Date(a.startAt).getTime() - new Date(b.startAt).getTime()

  const sections: AgendaSection[] = [
    { id: 'earlier', label: 'Earlier', events: buckets.earlier!.sort(byStart) },
    { id: 'today', label: 'Today', events: buckets.today!.sort(byStart) },
    { id: 'tomorrow', label: 'Tomorrow', events: buckets.tomorrow!.sort(byStart) },
    { id: 'thisWeek', label: 'This week', events: buckets.thisWeek!.sort(byStart) },
    { id: 'upcoming', label: 'Upcoming', events: buckets.upcoming!.sort(byStart) },
  ]

  // "Earlier" only appears when the current range actually contains past events.
  return sections.filter(
    (section) => section.id !== 'earlier' || section.events.length > 0,
  )
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function toTimeInputValue(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

/** Combines a `YYYY-MM-DD` date and `HH:mm` time into a local Date. */
export function combineDateTime(date: string, time: string) {
  const parsed = new Date(`${date}T${time || '00:00'}`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function minutesBetween(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / 60_000)
}

/** Rendered height of one half-hour slot in the week and day time grids. */
export const SLOT_HEIGHT_PX = 48
export const PIXELS_PER_MINUTE = SLOT_HEIGHT_PX / MINUTES_PER_SLOT

export function gridStartOf(day: Date) {
  const start = new Date(day)
  start.setHours(DAY_START_HOUR, 0, 0, 0)
  return start
}

/** Absolute placement of an event block inside a time grid column, in pixels. */
export function blockGeometry(event: CalendarEventItem, day: Date) {
  const gridStart = gridStartOf(day)
  const totalMinutes = (DAY_END_HOUR + 1 - DAY_START_HOUR) * 60

  const start = new Date(event.startAt)
  const end = new Date(event.endAt)

  const offset = Math.min(
    Math.max(minutesBetween(gridStart, start), 0),
    totalMinutes - MINUTES_PER_SLOT,
  )
  const duration = Math.max(minutesBetween(start, end), MINUTES_PER_SLOT)
  const clamped = Math.min(duration, totalMinutes - offset)

  return {
    top: offset * PIXELS_PER_MINUTE,
    height: clamped * PIXELS_PER_MINUTE,
    durationMinutes: duration,
  }
}

/** Snaps a minute value to the nearest quarter hour, used while resizing. */
export function snapMinutes(minutes: number, step = 15) {
  return Math.max(step, Math.round(minutes / step) * step)
}
