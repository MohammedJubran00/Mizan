import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { Textarea } from '@/shared/components/Textarea'

import { formatNoteDateTime } from '../lib/noteDate'

interface AddNoteDialogProps {
  open: boolean
  saving: boolean
  onSubmit: (payload: { title: string; body: string }) => void
  onClose: () => void
}

export function AddNoteDialog({
  open,
  saving,
  onSubmit,
  onClose,
}: AddNoteDialogProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!open) return
    setTitle('')
    setBody('')
    setSubmitAttempted(false)
    setNow(new Date())

    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [open])

  const trimmedBody = body.trim()
  const bodyError =
    submitAttempted && !trimmedBody ? 'Description is required.' : undefined

  function submit() {
    setSubmitAttempted(true)
    if (!trimmedBody) return
    onSubmit({ title: title.trim(), body: trimmedBody })
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => undefined : onClose}
      title="Add Note"
      description="Capture a title and description. The date is recorded automatically."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!trimmedBody}>
            Save note
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          name="title"
          label="Title"
          placeholder="e.g. Client call summary"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <Textarea
          name="body"
          label="Description"
          required
          rows={5}
          placeholder="What happened, decisions made, next steps…"
          value={body}
          error={bodyError}
          onChange={(event) => setBody(event.target.value)}
        />

        <p className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-xs text-text-muted">
          <Clock className="size-3.5 shrink-0 text-blue" aria-hidden="true" />
          <span>
            Date recorded automatically:{' '}
            <time dateTime={now.toISOString()} className="font-medium text-text-secondary">
              {formatNoteDateTime(now)}
            </time>
          </span>
        </p>
      </div>
    </Modal>
  )
}
