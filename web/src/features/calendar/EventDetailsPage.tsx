import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CalendarX2,
  CheckCircle2,
  Info,
  NotebookPen,
  Scale,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { InfoCard } from '@/shared/components/InfoCard'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatDateTime, formatShortDate, formatTime } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import { eventService } from './api/eventService'
import { AttachmentList } from './components/AttachmentList'
import { CompletionModal } from './components/CompletionModal'
import { DeleteEventModal } from './components/DeleteEventModal'
import { EventDetailsSkeleton } from './components/EventSkeletons'
import { EventHeader } from './components/EventHeader'
import { LocationCard } from './components/LocationCard'
import { ParticipantList } from './components/ParticipantList'
import { PersonCard } from './components/PersonCard'
import { ReminderCard } from './components/ReminderCard'
import { RescheduleEventModal } from './components/RescheduleEventModal'
import { useEventDetails, useEventMutations } from './hooks/useEventQueries'
import { minutesBetween } from './lib/calendarDates'
import { categoryLabels, priorityLabels, statusLabels } from './lib/labels'
import type {
  EventAttachment,
  EventCompletionPayload,
  EventReschedulePayload,
} from './types'

type ActiveDialog = 'reschedule' | 'complete' | 'delete' | null

function durationLabel(startAt: string, endAt: string, allDay: boolean) {
  if (allDay) return 'All day'

  const minutes = minutesBetween(new Date(startAt), new Date(endAt))
  if (!Number.isFinite(minutes) || minutes <= 0) return null

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours} h`
  return `${hours} h ${rest} min`
}

export function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const [dialog, setDialog] = useState<ActiveDialog>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const { event, state, refetch } = useEventDetails(eventId)

  const mutations = useEventMutations({
    onRescheduled: () => setDialog(null),
    onCompleted: () => setDialog(null),
    onDeleted: () => navigate('/calendar'),
  })

  function saveReschedule(payload: EventReschedulePayload) {
    if (!eventId) return
    mutations.rescheduleEvent.mutate({ id: eventId, payload })
  }

  function saveCompletion(payload: EventCompletionPayload) {
    if (!eventId) return
    mutations.completeEvent.mutate({ id: eventId, payload })
  }

  function confirmDelete() {
    if (!eventId) return
    mutations.deleteEvent.mutate(eventId)
  }

  async function downloadAttachment(attachment: EventAttachment) {
    if (!eventId) return

    setDownloadingId(attachment.id)

    try {
      const blob = await eventService.downloadAttachment(eventId, attachment.id)

      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = attachment.fileName
        link.click()
        URL.revokeObjectURL(url)
        return
      }

      if (attachment.downloadUrl) {
        window.open(attachment.downloadUrl, '_blank', 'noopener,noreferrer')
        return
      }

      toast.info(
        'Download unavailable',
        'Attachment downloads open once the events API is connected.',
      )
    } catch (error) {
      toast.error(
        'Could not download attachment',
        error instanceof Error ? error.message : 'Please try again.',
      )
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
      <TopBar
        title="Event details"
        subtitle="Everything scheduled, assigned, and attached to this event."
        actions={
          <Button size="sm" variant="secondary" onClick={() => navigate('/calendar')}>
            <ArrowLeft className="size-4" />
            Back to calendar
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Calendar', to: '/calendar' },
            { label: event?.title ?? 'Event' },
          ]}
        />

        {state === 'loading' ? <EventDetailsSkeleton /> : null}

        {state === 'error' ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load this event"
            description="Something went wrong while loading the event."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => refetch()}>
                  Retry
                </Button>
                <Button variant="ghost" onClick={() => navigate('/calendar')}>
                  Back to calendar
                </Button>
              </div>
            }
          />
        ) : null}

        {state === 'empty' ? (
          <EmptyState
            icon={CalendarX2}
            title="Event not found"
            description="This event does not exist yet, or it has been removed from the calendar."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => navigate('/calendar/events/new')}>
                  Create Event
                </Button>
                <Button variant="secondary" onClick={() => navigate('/calendar')}>
                  Back to calendar
                </Button>
              </div>
            }
          />
        ) : null}

        {state === 'ready' && event ? (
          <>
            <EventHeader
              event={event}
              onEdit={() => navigate(`/calendar/events/${event.id}/edit`)}
              onReschedule={() => setDialog('reschedule')}
              onToggleCompletion={() => setDialog('complete')}
              onPrint={() => window.print()}
              onDelete={() => setDialog('delete')}
            />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-5">
                <InfoCard
                  title="General information"
                  icon={Info}
                  columns={2}
                  items={[
                    { label: 'Event type', value: categoryLabels[event.category] },
                    { label: 'Priority', value: priorityLabels[event.priority] },
                    { label: 'Status', value: statusLabels[event.status] },
                    {
                      label: 'Duration',
                      value: durationLabel(event.startAt, event.endAt, event.allDay),
                    },
                    { label: 'Date', value: formatShortDate(event.startAt) },
                    {
                      label: 'Time',
                      value: event.allDay
                        ? 'All day'
                        : `${formatTime(event.startAt)} – ${formatTime(event.endAt)}`,
                    },
                    {
                      label: 'Description',
                      value: event.description,
                      wide: true,
                    },
                  ]}
                />

                <SectionCard title="Notes" icon={NotebookPen}>
                  {event.notes ? (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                      {event.notes}
                    </p>
                  ) : (
                    <p className="text-sm text-text-muted">
                      No internal notes have been added to this event.
                    </p>
                  )}
                </SectionCard>

                {event.completion ? (
                  <SectionCard title="Completion" icon={CheckCircle2}>
                    <p className="text-sm text-text-secondary">
                      Completed {formatDateTime(event.completion.completedAt)}
                      {event.completion.completedByName
                        ? ` by ${event.completion.completedByName}`
                        : ''}
                    </p>
                    {event.completion.notes ? (
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                        {event.completion.notes}
                      </p>
                    ) : null}
                  </SectionCard>
                ) : null}

                <ParticipantList participants={event.participants} />

                <AttachmentList
                  attachments={event.attachments}
                  downloadingId={downloadingId}
                  onDownload={downloadAttachment}
                  action={
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/calendar/events/${event.id}/edit`)}
                    >
                      Manage files
                    </Button>
                  }
                />

                <Card className="border-danger/30 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-danger">Danger zone</h2>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        Deleting removes the event, its reminders, participants, and
                        attachments. This cannot be undone.
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setDialog('delete')}
                    >
                      <Trash2 className="size-4" />
                      Delete event
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="space-y-5">
                <PersonCard
                  title="Related client"
                  icon={UserRound}
                  person={event.client}
                  emptyMessage="No client linked to this event."
                  actionLabel={event.client ? 'Open client' : undefined}
                  onAction={
                    event.client
                      ? () => navigate(`/clients/${event.client?.id}`)
                      : undefined
                  }
                />

                <SectionCard title="Related case" icon={Briefcase}>
                  {event.caseRef ? (
                    <div className="space-y-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy">
                          {event.caseRef.title}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          {event.caseRef.caseNumber}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        onClick={() => navigate(`/cases/${event.caseRef?.id}`)}
                      >
                        Open case
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">
                      No case linked to this event.
                    </p>
                  )}
                </SectionCard>

                <PersonCard
                  title="Assigned lawyer"
                  icon={Scale}
                  person={event.leadLawyer}
                  emptyMessage="No lead lawyer assigned yet."
                />

                <LocationCard location={event.location} />

                <ReminderCard
                  reminder={event.reminder}
                  startAt={event.startAt}
                  action={
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/calendar/events/${event.id}/edit`)}
                    >
                      Edit
                    </Button>
                  }
                />
              </div>
            </div>
          </>
        ) : null}
      </div>

      <RescheduleEventModal
        open={dialog === 'reschedule'}
        event={event}
        saving={mutations.rescheduleEvent.isPending}
        onSave={saveReschedule}
        onClose={() => setDialog(null)}
      />

      <CompletionModal
        open={dialog === 'complete'}
        event={event}
        completion={event?.completion ?? null}
        saving={mutations.completeEvent.isPending}
        onSave={saveCompletion}
        onClose={() => setDialog(null)}
      />

      <DeleteEventModal
        open={dialog === 'delete'}
        event={event}
        deleting={mutations.isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDialog(null)}
      />
    </>
  )
}
