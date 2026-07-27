/** Formats note timestamps as `27-07-2026, 12:35 pm`. */
export function formatNoteDateTime(iso: string | Date) {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(date.getTime())) return '—'

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const meridiem = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  if (hours === 0) hours = 12

  return `${day}-${month}-${year}, ${hours}:${minutes} ${meridiem}`
}
