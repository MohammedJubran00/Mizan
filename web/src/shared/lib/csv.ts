function escapeCell(value: unknown) {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(headers: string[], rows: unknown[][]) {
  return [headers, ...rows]
    .map((row) => row.map(escapeCell).join(','))
    .join('\r\n')
}

/** Triggers a client-side download of the given rows as a CSV file. */
export function downloadCsv(fileName: string, headers: string[], rows: unknown[][]) {
  // Byte order mark keeps accented characters readable when opened in Excel.
  const blob = new Blob([`\uFEFF${toCsv(headers, rows)}`], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
