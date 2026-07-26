import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Tracks checkbox selection for a table. Keys that disappear from `availableKeys`
 * (page change, filter change) are dropped so bulk actions never target stale rows.
 */
export function useRowSelection(availableKeys: string[]) {
  const [selected, setSelected] = useState<string[]>([])

  const availableSet = useMemo(() => new Set(availableKeys), [availableKeys])

  useEffect(() => {
    setSelected((current) => {
      const next = current.filter((key) => availableSet.has(key))
      return next.length === current.length ? current : next
    })
  }, [availableSet])

  const toggle = useCallback((key: string) => {
    setSelected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    )
  }, [])

  const toggleAll = useCallback(() => {
    setSelected((current) =>
      current.length === availableKeys.length ? [] : [...availableKeys],
    )
  }, [availableKeys])

  const clear = useCallback(() => setSelected([]), [])

  const isSelected = useCallback(
    (key: string) => selected.includes(key),
    [selected],
  )

  return {
    selected,
    count: selected.length,
    allSelected: availableKeys.length > 0 && selected.length === availableKeys.length,
    someSelected: selected.length > 0 && selected.length < availableKeys.length,
    toggle,
    toggleAll,
    clear,
    isSelected,
  }
}
