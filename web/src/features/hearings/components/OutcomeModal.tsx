import { useEffect, useState } from 'react'

import { Button } from '@/shared/components/Button'
import { Checkbox } from '@/shared/components/Checkbox'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { Select } from '@/shared/components/Select'
import { Textarea } from '@/shared/components/Textarea'
import { cn } from '@/shared/lib/utils'

import {
  hearingOutcomeLabels,
  nextActionOptions,
} from '../lib/labels'
import {
  emptyOutcomeForm,
  validateOutcomeForm,
  type OutcomeFormErrors,
} from '../lib/outcomeForm'
import { HEARING_OUTCOMES, type HearingListItem, type HearingOutcomePayload } from '../types'

interface OutcomeModalProps {
  open: boolean
  hearing: HearingListItem | null
  saving: boolean
  onSave: (payload: HearingOutcomePayload) => void
  onClose: () => void
}

export function OutcomeModal({
  open,
  hearing,
  saving,
  onSave,
  onClose,
}: OutcomeModalProps) {
  const [values, setValues] = useState<HearingOutcomePayload>(emptyOutcomeForm)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  useEffect(() => {
    if (open) {
      setValues(emptyOutcomeForm)
      setSubmitAttempted(false)
    }
  }, [open])

  const errors = validateOutcomeForm(values)
  const isValid = Object.keys(errors).length === 0
  const visible: OutcomeFormErrors = submitAttempted ? errors : {}

  function submit() {
    setSubmitAttempted(true)
    if (!isValid) return
    onSave(values)
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => undefined : onClose}
      title="Update Outcome"
      description="Record the result of this hearing for the case file."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Discard
          </Button>
          <Button onClick={submit} loading={saving} disabled={!isValid}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {hearing ? (
          <div className="rounded-xl border border-border-subtle bg-surface-muted px-3.5 py-3">
            <p className="font-mono text-xs text-blue">
              {hearing.caseRef?.caseNumber ?? 'Unlinked case'}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-navy">
              {hearing.caseRef?.title ?? 'Hearing'}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              {hearing.court ?? 'Court TBD'}
            </p>
          </div>
        ) : null}

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-text">
            Outcome<span className="ml-0.5 text-danger">*</span>
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Outcome">
            {HEARING_OUTCOMES.map((outcome) => {
              const selected = values.result === outcome
              return (
                <button
                  key={outcome}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setValues((current) => ({ ...current, result: outcome }))}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-semibold transition',
                    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/15',
                    selected
                      ? 'border-navy bg-navy text-white'
                      : 'border-border bg-white text-text-secondary hover:bg-surface-muted',
                  )}
                >
                  {hearingOutcomeLabels[outcome]}
                </button>
              )
            })}
          </div>
          {visible.result ? (
            <p className="mt-1.5 text-xs text-danger">{visible.result}</p>
          ) : null}
        </fieldset>

        <Textarea
          label="Judge Decision"
          required
          rows={3}
          placeholder="Enter formal decision details…"
          value={values.judgeDecision}
          error={visible.judgeDecision}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              judgeDecision: event.target.value,
            }))
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Summary"
            placeholder="Key takeaways"
            value={values.summary}
            onChange={(event) =>
              setValues((current) => ({ ...current, summary: event.target.value }))
            }
          />
          <Select
            label="Next Action"
            placeholder="Select next action"
            options={nextActionOptions}
            value={values.nextAction}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                nextAction: event.target.value as HearingOutcomePayload['nextAction'],
              }))
            }
          />
        </div>

        <Checkbox
          label="Schedule follow-up hearing"
          checked={values.scheduleFollowUp}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              scheduleFollowUp: event.target.checked,
            }))
          }
        />
      </div>
    </Modal>
  )
}
