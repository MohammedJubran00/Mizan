import { Check } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'
import { cn } from '@/shared/lib/utils'

import { caseStatusDescriptions, caseStatusLabels } from '../lib/labels'
import { CASE_STATUSES, type CaseStatus } from '../types'

interface StatusModalProps {
  open: boolean
  currentStatus: CaseStatus
  saving: boolean
  onApply: (status: CaseStatus) => void
  onClose: () => void
}

export function StatusModal({
  open,
  currentStatus,
  saving,
  onApply,
  onClose,
}: StatusModalProps) {
  const [selected, setSelected] = useState<CaseStatus>(currentStatus)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) setSelected(currentStatus)
  }, [open, currentStatus])

  function focusOption(status: CaseStatus) {
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-status="${status}"]`)
      ?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = CASE_STATUSES.indexOf(selected)
    let nextIndex: number | null = null

    if (event.key === 'ArrowDown') nextIndex = (index + 1) % CASE_STATUSES.length
    if (event.key === 'ArrowUp') {
      nextIndex = (index - 1 + CASE_STATUSES.length) % CASE_STATUSES.length
    }
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = CASE_STATUSES.length - 1

    if (nextIndex === null) return

    event.preventDefault()
    const next = CASE_STATUSES[nextIndex]
    setSelected(next)
    focusOption(next)
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => undefined : onClose}
      title="Change Case Status"
      description="Update the current lifecycle state of this legal matter."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={() => onApply(selected)}
            loading={saving}
            disabled={selected === currentStatus}
          >
            Apply Changes
          </Button>
        </>
      }
    >
      <div
        ref={listRef}
        role="radiogroup"
        aria-label="Case status"
        onKeyDown={onKeyDown}
        className="max-h-[22rem] space-y-1 overflow-y-auto pr-1"
      >
        {CASE_STATUSES.map((status) => {
          const isSelected = status === selected
          const isCurrent = status === currentStatus

          return (
            <button
              key={status}
              type="button"
              role="radio"
              data-status={status}
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(status)}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15',
                isSelected
                  ? 'border-blue bg-blue-soft/60'
                  : 'border-border-subtle hover:bg-surface-muted',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2',
                  isSelected ? 'border-blue bg-blue' : 'border-border',
                )}
              >
                {isSelected ? <Check className="size-2.5 text-white" /> : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-navy">
                    {caseStatusLabels[status]}
                  </span>
                  {isCurrent ? (
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                      Current
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-text-secondary">
                  {caseStatusDescriptions[status]}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
