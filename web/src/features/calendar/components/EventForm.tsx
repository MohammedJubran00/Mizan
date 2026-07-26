import { Bell, Briefcase, Info, MapPin, Paperclip, Users } from 'lucide-react'
import type { FormEvent } from 'react'

import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Checkbox } from '@/shared/components/Checkbox'
import { ChoiceChips } from '@/shared/components/ChoiceChips'
import { Input } from '@/shared/components/Input'
import { PersonPicker } from '@/shared/components/PersonPicker'
import { SectionCard } from '@/shared/components/SectionCard'
import { Select } from '@/shared/components/Select'
import { Textarea } from '@/shared/components/Textarea'

import type { EventFormApi } from '../hooks/useEventForm'
import {
  categoryOptions,
  priorityOptions,
  reminderMethodOptions,
  reminderOffsetOptions,
  reminderSummary,
  statusOptions,
} from '../lib/labels'
import { searchCases, searchClients, searchLawyers } from '../lib/pickerSources'
import { EVENT_PRIORITIES, type EventCategory, type EventPriority, type EventStatus, type ReminderMethod } from '../types'
import { AttachmentUploader } from './AttachmentUploader'
import { ParticipantSelector } from './ParticipantSelector'

interface EventFormProps {
  form: EventFormApi
  attachments: File[]
  onAttachmentsChange: (files: File[]) => void
  submitLabel: string
  saving: boolean
  uploading?: boolean
  onSubmit: () => void
  onCancel: () => void
}

const priorityChipOptions = EVENT_PRIORITIES.map((priority) => ({
  value: priority,
  label: priorityOptions.find((option) => option.value === priority)?.label ?? priority,
}))

export function EventForm({
  form,
  attachments,
  onAttachmentsChange,
  submitLabel,
  saving,
  uploading = false,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const { values, errors, isValid, setField, blurField } = form

  function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <SectionCard
        title="General information"
        description="What the event is about"
        icon={Info}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Event type"
            required
            placeholder="Select an event type"
            options={categoryOptions}
            value={values.category}
            error={errors.category}
            onChange={(event) =>
              setField('category', event.target.value as EventCategory | '')
            }
            onBlur={() => blurField('category')}
          />

          <Select
            label="Status"
            required
            options={statusOptions}
            value={values.status}
            error={errors.status}
            onChange={(event) =>
              setField('status', event.target.value as EventStatus | '')
            }
            onBlur={() => blurField('status')}
          />

          <div className="sm:col-span-2">
            <ChoiceChips
              label="Priority"
              required
              value={values.priority}
              options={priorityChipOptions}
              error={errors.priority}
              onChange={(value: EventPriority) => setField('priority', value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Title"
              required
              placeholder="e.g. Settlement conference with opposing counsel"
              value={values.title}
              error={errors.title}
              onChange={(event) => setField('title', event.target.value)}
              onBlur={() => blurField('title')}
            />
          </div>

          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              rows={4}
              placeholder="Add the agenda, preparation notes, or expected outcome…"
              value={values.description}
              onChange={(event) => setField('description', event.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Assignment"
        description="Who this event belongs to"
        icon={Users}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <PersonPicker
            label="Client"
            placeholder="Search clients…"
            queryKey="event-client-picker"
            fetchPeople={searchClients}
            selectedName={values.clientName}
            onSelect={form.setClient}
            emptyMessage="No clients found. Create a client first."
          />

          <PersonPicker
            label="Related case"
            placeholder="Search case number or title…"
            queryKey="event-case-picker"
            fetchPeople={searchCases}
            selectedName={values.caseLabel}
            onSelect={(option) =>
              form.setCase(
                option
                  ? {
                      id: option.id,
                      caseNumber: option.caseNumber,
                      title: option.title,
                    }
                  : null,
              )
            }
            emptyMessage="No cases found."
          />

          <PersonPicker
            label="Lead lawyer"
            placeholder="Search team members…"
            queryKey="event-lawyer-picker"
            fetchPeople={searchLawyers}
            selectedName={values.leadLawyerName}
            onSelect={form.setLeadLawyer}
            emptyMessage="No team members available yet."
          />

          <div className="sm:col-span-2">
            <ParticipantSelector
              participants={values.participants}
              onAdd={form.addParticipant}
              onRemove={form.removeParticipant}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Schedule & location"
        description="When and where it happens"
        icon={MapPin}
      >
        <div className="space-y-4">
          <Checkbox
            label="All-day event"
            checked={values.allDay}
            onChange={(event) => setField('allDay', event.target.checked)}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Date"
              type="date"
              required
              value={values.date}
              error={errors.date}
              onChange={(event) => setField('date', event.target.value)}
              onBlur={() => blurField('date')}
            />
            <Input
              label="Start time"
              type="time"
              required={!values.allDay}
              disabled={values.allDay}
              value={values.startTime}
              error={errors.startTime}
              onChange={(event) => setField('startTime', event.target.value)}
              onBlur={() => blurField('startTime')}
            />
            <Input
              label="End time"
              type="time"
              required={!values.allDay}
              disabled={values.allDay}
              value={values.endTime}
              error={errors.endTime}
              onChange={(event) => setField('endTime', event.target.value)}
              onBlur={() => blurField('endTime')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Location"
              placeholder="e.g. Head office, Courtroom 4B"
              value={values.locationName}
              onChange={(event) => setField('locationName', event.target.value)}
            />
            <Input
              label="Room or floor"
              placeholder="e.g. Meeting room 2"
              value={values.locationRoom}
              onChange={(event) => setField('locationRoom', event.target.value)}
            />
            <div className="sm:col-span-2">
              <Input
                label="Address"
                placeholder="Street, city, postal code"
                value={values.locationAddress}
                onChange={(event) => setField('locationAddress', event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Virtual meeting link"
                type="url"
                placeholder="https://…"
                value={values.locationVirtualUrl}
                error={errors.locationVirtualUrl}
                onChange={(event) =>
                  setField('locationVirtualUrl', event.target.value)
                }
                onBlur={() => blurField('locationVirtualUrl')}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Reminder"
        description="Notify the team before the event starts"
        icon={Bell}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Reminder time"
            options={reminderOffsetOptions}
            value={values.reminderOffset}
            error={errors.reminderOffset}
            disabled={!values.reminderMethod || values.reminderMethod === 'NONE'}
            onChange={(event) => setField('reminderOffset', event.target.value)}
          />
          <Select
            label="Reminder method"
            options={reminderMethodOptions}
            value={values.reminderMethod}
            onChange={(event) =>
              setField('reminderMethod', event.target.value as ReminderMethod | '')
            }
          />
          <p className="text-xs text-text-muted sm:col-span-2">
            {reminderSummary(
              values.reminderOffset ? Number(values.reminderOffset) : null,
              values.reminderMethod,
            )}
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title="Attachments"
        description="Agendas, briefs, or supporting files"
        icon={Paperclip}
      >
        <AttachmentUploader
          files={attachments}
          onChange={onAttachmentsChange}
          uploading={uploading}
        />
      </SectionCard>

      <SectionCard
        title="Internal notes"
        description="Only visible to your workspace"
        icon={Briefcase}
      >
        <Textarea
          label="Notes"
          rows={4}
          placeholder="Anything the team should know before this event…"
          value={values.notes}
          onChange={(event) => setField('notes', event.target.value)}
        />
      </SectionCard>

      <Card className="flex flex-wrap items-center justify-end gap-2 p-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving} disabled={!isValid}>
          {submitLabel}
        </Button>
      </Card>
    </form>
  )
}
