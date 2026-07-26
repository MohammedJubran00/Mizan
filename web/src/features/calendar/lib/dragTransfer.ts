/** Custom MIME type so calendar drags never conflict with file or text drops. */
const DRAG_MIME = 'application/x-mizan-event'

export interface EventDragPayload {
  id: string
  startAt: string
  endAt: string
  /** Minutes between the event start and the point the user grabbed. */
  grabOffsetMinutes: number
}

export function setEventDragPayload(
  dataTransfer: DataTransfer,
  payload: EventDragPayload,
) {
  dataTransfer.effectAllowed = 'move'
  dataTransfer.setData(DRAG_MIME, JSON.stringify(payload))
}

export function readEventDragPayload(
  dataTransfer: DataTransfer,
): EventDragPayload | null {
  const raw = dataTransfer.getData(DRAG_MIME)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<EventDragPayload>
    if (!parsed.id || !parsed.startAt || !parsed.endAt) return null

    return {
      id: parsed.id,
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      grabOffsetMinutes: parsed.grabOffsetMinutes ?? 0,
    }
  } catch {
    return null
  }
}

export function hasEventDragPayload(dataTransfer: DataTransfer) {
  return dataTransfer.types.includes(DRAG_MIME)
}
