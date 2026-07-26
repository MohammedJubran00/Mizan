import { AlertCircle, ArrowLeft, CalendarX2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { EmptyState } from '@/shared/components/EmptyState'

import { EventForm } from './components/EventForm'
import { EventFormSkeleton } from './components/EventSkeletons'
import { useEventForm } from './hooks/useEventForm'
import { useEventDetails, useEventMutations } from './hooks/useEventQueries'
import { toDateInputValue } from './lib/calendarDates'
import {
  emptyEventFormValues,
  toEventFormValues,
  toEventPayload,
  type EventFormValues,
} from './lib/eventForm'
import type { EventDetails } from './types'

interface EventFormPageProps {
  mode: 'create' | 'edit'
}

export function EventFormPage({ mode }: EventFormPageProps) {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { event, state, refetch } = useEventDetails(
    mode === 'edit' ? eventId : undefined,
  )

  // Creating from a calendar cell carries the clicked slot through the URL.
  const initialCreateValues = useMemo<EventFormValues>(() => {
    const dateParam = searchParams.get('date')
    const timeParam = searchParams.get('time')
    const parsedDate = dateParam ? new Date(`${dateParam}T00:00`) : null
    const date =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? toDateInputValue(parsedDate)
        : ''

    if (!date && !timeParam) return emptyEventFormValues

    const startTime = timeParam ?? ''
    const endTime = startTime
      ? (() => {
          const [hours, minutes] = startTime.split(':').map(Number)
          const end = new Date()
          end.setHours((hours ?? 0) + 1, minutes ?? 0, 0, 0)
          return `${`${end.getHours()}`.padStart(2, '0')}:${`${end.getMinutes()}`.padStart(2, '0')}`
        })()
      : ''

    return { ...emptyEventFormValues, date, startTime, endTime }
  }, [searchParams])

  if (mode === 'create') {
    return <EventFormEditor mode="create" initialValues={initialCreateValues} />
  }

  if (state === 'loading') {
    return (
      <>
        <TopBar title="Edit event" subtitle="Loading event…" />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EventFormSkeleton />
        </div>
      </>
    )
  }

  if (state === 'error') {
    return (
      <>
        <TopBar title="Edit event" subtitle="Update this calendar entry" />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load event"
            description="We were unable to load this event for editing."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      </>
    )
  }

  if (event === null) {
    return (
      <>
        <TopBar title="Edit event" subtitle="Update this calendar entry" />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={CalendarX2}
            title="Event not found"
            description="This event no longer exists or you do not have access to it."
            action={
              <Button variant="secondary" onClick={() => navigate('/calendar')}>
                <ArrowLeft className="size-4" />
                Back to calendar
              </Button>
            }
          />
        </div>
      </>
    )
  }

  return (
    <EventFormEditor
      key={event.id}
      mode="edit"
      event={event}
      initialValues={toEventFormValues(event)}
    />
  )
}

interface EventFormEditorProps {
  mode: 'create' | 'edit'
  event?: EventDetails
  initialValues: EventFormValues
}

function EventFormEditor({ mode, event, initialValues }: EventFormEditorProps) {
  const navigate = useNavigate()
  const form = useEventForm(initialValues)
  const [attachments, setAttachments] = useState<File[]>([])
  const [discardOpen, setDiscardOpen] = useState(false)

  const isEdit = mode === 'edit' && event !== undefined
  const backTo = isEdit ? `/calendar/events/${event.id}` : '/calendar'

  const {
    createEvent,
    updateEvent,
    uploadAttachment,
    isCreating,
    isUpdating,
    isUploading,
  } = useEventMutations({
    onCreated: async (created) => {
      if (created) {
        await uploadPending(created.id)
        navigate(`/calendar/events/${created.id}`, { replace: true })
        return
      }
      navigate('/calendar', { replace: true })
    },
    onUpdated: async () => {
      if (isEdit) await uploadPending(event.id)
      navigate(backTo, { replace: true })
    },
  })

  async function uploadPending(targetId: string) {
    for (const file of attachments) {
      await uploadAttachment.mutateAsync({ eventId: targetId, file })
    }
    setAttachments([])
  }

  const saving = isEdit ? isUpdating : isCreating

  function submit() {
    form.markSubmitted()
    if (!form.isValid) return

    const payload = toEventPayload(form.values)

    if (isEdit) {
      updateEvent.mutate({ id: event.id, payload })
      return
    }

    createEvent.mutate(payload)
  }

  function cancel() {
    if (form.isDirty || attachments.length > 0) {
      setDiscardOpen(true)
      return
    }
    navigate(backTo)
  }

  return (
    <>
      <TopBar
        title={isEdit ? 'Edit event' : 'Create event'}
        subtitle={
          isEdit
            ? 'Update the schedule, assignment, and reminders for this event.'
            : 'Add a meeting, hearing, deadline, task, or reminder to the firm calendar.'
        }
        actions={
          <Button size="sm" variant="ghost" onClick={cancel}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-5xl flex-1 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Calendar', to: '/calendar' },
            ...(isEdit
              ? [
                  { label: event.title, to: `/calendar/events/${event.id}` },
                  { label: 'Edit' },
                ]
              : [{ label: 'New event' }]),
          ]}
        />

        <EventForm
          form={form}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          saving={saving}
          uploading={isUploading}
          submitLabel={isEdit ? 'Save changes' : 'Create Event'}
          onSubmit={submit}
          onCancel={cancel}
        />
      </div>

      <ConfirmationDialog
        open={discardOpen}
        title="Discard changes?"
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        tone="primary"
        onCancel={() => setDiscardOpen(false)}
        onConfirm={() => {
          setDiscardOpen(false)
          navigate(backTo)
        }}
      >
        Your unsaved changes to this event, including selected attachments, will be
        lost.
      </ConfirmationDialog>
    </>
  )
}
