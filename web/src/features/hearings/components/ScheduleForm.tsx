import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  Briefcase,
  CalendarClock,
  Gavel,
  Scale,
  UserRound,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { caseService } from '@/features/cases/api/caseService'
import { Avatar } from '@/shared/components/Avatar'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Checkbox } from '@/shared/components/Checkbox'
import { Input } from '@/shared/components/Input'
import { PersonPicker } from '@/shared/components/PersonPicker'
import { SectionCard } from '@/shared/components/SectionCard'
import { Select } from '@/shared/components/Select'
import { Textarea } from '@/shared/components/Textarea'
import { cn } from '@/shared/lib/utils'

import { hearingService } from '../api/hearingService'
import type { HearingFormApi } from '../hooks/useHearingForm'
import { durationOptions, hearingTypeOptions } from '../lib/labels'
import type { HearingCaseRef, HearingPersonRef } from '../types'

interface ScheduleFormProps {
  form: HearingFormApi
  submitLabel: string
  saving: boolean
  onSubmit: () => void
  onCancel: () => void
}

async function searchCases(search: string): Promise<HearingPersonRef[]> {
  const response = await caseService.getCases({
    search: search || undefined,
    status: 'ALL',
    practiceArea: 'ALL',
    priority: 'ALL',
    sortBy: 'createdAt',
    sortDir: 'desc',
    page: 1,
    pageSize: 20,
  })

  return response.items.map((item) => ({
    id: item.id,
    fullName: `${item.caseNumber} — ${item.title}`,
    subtitle: item.client?.fullName ?? null,
  }))
}

export function ScheduleForm({
  form,
  submitLabel,
  saving,
  onSubmit,
  onCancel,
}: ScheduleFormProps) {
  const navigate = useNavigate()
  const { values, errors, isValid, setField, blurField } = form

  const caseQuery = useQuery({
    queryKey: ['hearing-case-detail', values.caseId],
    queryFn: () => caseService.getCase(values.caseId),
    enabled: Boolean(values.caseId),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    form.markSubmitted()
    if (!isValid) return
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <SectionCard title="Case Information" icon={Briefcase} bodyClassName="space-y-4 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <PersonPicker
            label="Active Case"
            required
            placeholder="Select a case…"
            queryKey="hearing-case-picker"
            fetchPeople={searchCases}
            selectedName={values.caseLabel}
            onSelect={(person) => {
              if (!person) {
                form.setCase(null)
                return
              }
              const caseRef: HearingCaseRef = {
                id: person.id,
                caseNumber: person.fullName.split(' — ')[0] ?? person.fullName,
                title: person.fullName.split(' — ').slice(1).join(' — ') || person.fullName,
              }
              form.setCase(caseRef, person.subtitle ?? '')
            }}
            error={errors.caseId}
            onBlurField={() => blurField('caseId')}
            emptyMessage="No cases found. Create a case first."
            emptyActionLabel="Create a case"
            onEmptyAction={() => navigate('/cases/new')}
          />

          <Input
            label="Client Name (auto-filled)"
            value={
              caseQuery.data?.client?.fullName ??
              values.clientName
            }
            disabled
            hint="Populates from the selected case."
          />
        </div>
      </SectionCard>

      <SectionCard title="Court Information" icon={Gavel} bodyClassName="px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Court Name"
            required
            placeholder="e.g. Superior Court"
            value={values.court}
            error={errors.court}
            onChange={(event) => setField('court', event.target.value)}
            onBlur={() => blurField('court')}
          />
          <Input
            label="Courtroom"
            placeholder="e.g. 402B"
            value={values.room}
            onChange={(event) => setField('room', event.target.value)}
          />
          <Input
            label="Judge"
            placeholder="Hon. Michael Vance"
            value={values.judgeName}
            onChange={(event) => setField('judgeName', event.target.value)}
          />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Schedule" icon={CalendarClock} bodyClassName="space-y-4 px-5 py-5">
          <Input
            label="Hearing Date"
            type="date"
            required
            value={values.date}
            error={errors.date}
            onChange={(event) => setField('date', event.target.value)}
            onBlur={() => blurField('date')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Time"
              type="time"
              required
              value={values.time}
              error={errors.time}
              onChange={(event) => setField('time', event.target.value)}
              onBlur={() => blurField('time')}
            />
            <Select
              label="Duration"
              required
              options={durationOptions}
              value={values.durationMinutes}
              error={errors.durationMinutes}
              onChange={(event) => setField('durationMinutes', event.target.value as typeof values.durationMinutes)}
              onBlur={() => blurField('durationMinutes')}
            />
          </div>
        </SectionCard>

        <SectionCard title="Assignment" icon={Scale} bodyClassName="space-y-4 px-5 py-5">
          <PersonPicker
            label="Lead Lawyer"
            placeholder="Select lawyer…"
            queryKey="hearing-lawyer-picker"
            fetchPeople={(search) => hearingService.getAssignableLawyers(search)}
            selectedName={values.leadLawyerName}
            onSelect={form.setLeadLawyer}
            emptyMessage="No assignable team members are available yet."
          />

          {values.leadLawyerName ? (
            <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-muted px-3.5 py-3">
              <Avatar name={values.leadLawyerName} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy">
                  {values.leadLawyerName}
                </p>
                <Badge variant="success">Ready for assignment</Badge>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-border px-3.5 py-3 text-sm text-text-muted">
              <UserRound className="size-4" />
              Select a lead lawyer to preview the assignment.
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Details" icon={Briefcase} bodyClassName="space-y-4 px-5 py-5">
        <Select
          label="Hearing Type"
          required
          placeholder="Select hearing type"
          options={hearingTypeOptions}
          value={values.type}
          error={errors.type}
          onChange={(event) => setField('type', event.target.value as typeof values.type)}
          onBlur={() => blurField('type')}
        />
        <Textarea
          label="Description & Notes"
          rows={4}
          placeholder="Enter key points or specific instructions for this hearing…"
          value={values.notes}
          onChange={(event) => setField('notes', event.target.value)}
        />
      </SectionCard>

      <SectionCard
        title="Notifications & Reminders"
        icon={Bell}
        bodyClassName="space-y-4 px-5 py-5"
        action={
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-text-secondary">
            <span
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition',
                values.notifyClient ? 'bg-navy' : 'bg-border',
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={values.notifyClient}
                onChange={(event) => setField('notifyClient', event.target.checked)}
                aria-label="Notify client"
              />
              <span
                className={cn(
                  'inline-block size-4 translate-x-0.5 rounded-full bg-white transition',
                  values.notifyClient && 'translate-x-4',
                )}
              />
            </span>
            Notify Client
          </label>
        }
      >
        <Input
          label="First Reminder Date"
          type="date"
          value={values.reminderDate}
          error={errors.reminderDate}
          disabled={!values.notifyClient}
          onChange={(event) => setField('reminderDate', event.target.value)}
          onBlur={() => blurField('reminderDate')}
        />
        <div className="flex flex-wrap gap-4">
          <Checkbox
            label="Email Notification"
            checked={values.notifyEmail}
            disabled={!values.notifyClient}
            onChange={(event) => setField('notifyEmail', event.target.checked)}
          />
          <Checkbox
            label="SMS Alert"
            checked={values.notifySms}
            disabled={!values.notifyClient}
            onChange={(event) => setField('notifySms', event.target.checked)}
          />
        </div>
        {errors.notifyEmail ? (
          <p className="text-xs text-danger">{errors.notifyEmail}</p>
        ) : null}
      </SectionCard>

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text-muted">
          {isValid
            ? 'All required fields are complete.'
            : 'Complete the required fields to schedule this hearing.'}
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isValid} loading={saving}>
            <CalendarClock className="size-4" />
            {submitLabel}
          </Button>
        </div>
      </Card>
    </form>
  )
}
