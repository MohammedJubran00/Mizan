import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { formatShortDate, formatTime } from '@/shared/lib/utils'

import type { CalendarEventItem } from '../types'

interface DeleteEventModalProps {
  open: boolean
  event: CalendarEventItem | null
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteEventModal({
  open,
  event,
  deleting,
  onConfirm,
  onCancel,
}: DeleteEventModalProps) {
  return (
    <ConfirmationDialog
      open={open}
      title="Delete event"
      confirmLabel={deleting ? 'Deleting…' : 'Delete event'}
      loading={deleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <p>
        {event ? (
          <>
            <strong className="font-semibold text-navy">{event.title}</strong> on{' '}
            {formatShortDate(event.startAt)}
            {event.allDay ? '' : ` at ${formatTime(event.startAt)}`} will be removed
            from the calendar.
          </>
        ) : (
          'This event will be removed from the calendar.'
        )}
      </p>
      <p className="mt-2">
        Participants, reminders, and attachments linked to it are deleted as well.
        This cannot be undone.
      </p>
    </ConfirmationDialog>
  )
}
