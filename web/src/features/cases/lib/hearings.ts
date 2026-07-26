import type { Hearing } from '../types'

/** The soonest hearing that has not happened yet, or null when none remain. */
export function nextHearingOf(hearings: Hearing[]) {
  const now = Date.now()

  return (
    [...hearings]
      .filter((hearing) => new Date(hearing.scheduledAt).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )[0] ?? null
  )
}
