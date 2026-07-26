import { Bell } from 'lucide-react'

import { SectionCard } from '@/shared/components/SectionCard'
import { formatDateTime } from '@/shared/lib/utils'

import { reminderMethodLabels, reminderSummary } from '../lib/labels'
import type { EventReminder } from '../types'

interface ReminderCardProps {
  reminder: EventReminder | null
  /** Used to show when the reminder will fire. */
  startAt: string
  action?: React.ReactNode
}

export function ReminderCard({ reminder, startAt, action }: ReminderCardProps) {
  const fireAt =
    reminder && reminder.method !== 'NONE'
      ? new Date(new Date(startAt).getTime() - reminder.offsetMinutes * 60_000)
      : null

  return (
    <SectionCard title="Reminder" icon={Bell} action={action}>
      {!reminder || reminder.method === 'NONE' ? (
        <p className="text-sm text-text-muted">
          No reminder set for this event. Edit the event to add one.
        </p>
      ) : (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-navy">
            {reminderSummary(reminder.offsetMinutes, reminder.method)}
          </p>
          {fireAt && !Number.isNaN(fireAt.getTime()) ? (
            <p className="text-xs text-text-muted">
              Fires {formatDateTime(fireAt.toISOString())} via{' '}
              {reminderMethodLabels[reminder.method]}
            </p>
          ) : null}
          {reminder.sentAt ? (
            <p className="text-xs text-success">
              Sent {formatDateTime(reminder.sentAt)}
            </p>
          ) : (
            <p className="text-xs text-text-muted">Not sent yet.</p>
          )}
        </div>
      )}
    </SectionCard>
  )
}
