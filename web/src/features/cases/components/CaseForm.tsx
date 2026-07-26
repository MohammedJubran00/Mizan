import { CalendarClock, Gavel, Info, Tags, UserRound, Users, X } from 'lucide-react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { clientService } from '@/features/clients/api/clientService'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { ChoiceChips } from '@/shared/components/ChoiceChips'
import { Input } from '@/shared/components/Input'
import { PersonPicker } from '@/shared/components/PersonPicker'
import { SectionCard } from '@/shared/components/SectionCard'
import { Select } from '@/shared/components/Select'
import { Textarea } from '@/shared/components/Textarea'
import { formatRelativeTime } from '@/shared/lib/utils'

import { caseService } from '../api/caseService'
import type { CaseFormApi } from '../hooks/useCaseForm'
import {
  casePriorityOptions,
  caseStatusOptions,
  practiceAreaOptions,
} from '../lib/labels'
import type { CasePersonRef, CasePriority } from '../types'

interface CaseFormProps {
  form: CaseFormApi
  submitLabel: string
  saving: boolean
  /** Drafts only apply to the create flow. */
  showDraftActions?: boolean
  draftSavedAt?: string | null
  onSaveDraft?: () => void
  onSubmit: () => void
  onCancel: () => void
}

async function searchClients(search: string): Promise<CasePersonRef[]> {
  const clients = await clientService.getClients({ search: search || undefined })

  return clients.map((client) => ({
    id: client.id,
    fullName: client.fullName,
    subtitle: client.companyName ?? null,
    email: client.email,
    phone: client.phone,
  }))
}

export function CaseForm({
  form,
  submitLabel,
  saving,
  showDraftActions = false,
  draftSavedAt,
  onSaveDraft,
  onSubmit,
  onCancel,
}: CaseFormProps) {
  const navigate = useNavigate()
  const { values, errors, isValid, setField, blurField } = form

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    form.markSubmitted()

    if (!isValid) return
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <SectionCard
            title="Basic Information"
            icon={Info}
            bodyClassName="space-y-4 px-5 py-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="caseNumber"
                label="Case Number"
                placeholder="e.g. 2024-CV-0891"
                hint="Leave empty to let the system assign one."
                value={values.caseNumber}
                error={errors.caseNumber}
                onChange={(event) => setField('caseNumber', event.target.value)}
                onBlur={() => blurField('caseNumber')}
              />
              <Select
                name="practiceArea"
                label="Practice Area"
                required
                placeholder="Select a practice area"
                options={practiceAreaOptions}
                value={values.practiceArea}
                error={errors.practiceArea}
                onChange={(event) => setField('practiceArea', event.target.value)}
                onBlur={() => blurField('practiceArea')}
              />
            </div>

            <Input
              name="title"
              label="Case Title"
              required
              placeholder="Enter full matter title"
              value={values.title}
              error={errors.title}
              onChange={(event) => setField('title', event.target.value)}
              onBlur={() => blurField('title')}
            />

            <PersonPicker
              label="Client Selection"
              required
              placeholder="Search and select client…"
              queryKey="case-client-picker"
              fetchPeople={searchClients}
              selectedName={values.clientName}
              onSelect={form.setClient}
              error={errors.clientId}
              onBlurField={() => blurField('clientId')}
              emptyMessage="No clients found for this search."
              emptyActionLabel="Create a client"
              onEmptyAction={() => navigate('/clients/new')}
            />

            <Textarea
              name="description"
              label="Brief Description"
              rows={4}
              placeholder="Summary of the legal claim or defence…"
              value={values.description}
              onChange={(event) => setField('description', event.target.value)}
            />
          </SectionCard>

          <SectionCard
            title="Legal Jurisdiction"
            icon={Gavel}
            bodyClassName="px-5 py-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="court"
                label="Court / Tribunal"
                className="sm:col-span-2"
                placeholder="e.g. U.S. District Court, Northern District of Illinois"
                value={values.court}
                error={errors.court}
                onChange={(event) => setField('court', event.target.value)}
                onBlur={() => blurField('court')}
              />
              <Input
                name="judgeName"
                label="Presiding Judge"
                placeholder="e.g. Hon. Jane Doe"
                value={values.judgeName}
                error={errors.judgeName}
                onChange={(event) => setField('judgeName', event.target.value)}
                onBlur={() => blurField('judgeName')}
              />
              <Input
                name="opposingParty"
                label="Opposing Party"
                placeholder="Enter party name"
                value={values.opposingParty}
                error={errors.opposingParty}
                onChange={(event) => setField('opposingParty', event.target.value)}
                onBlur={() => blurField('opposingParty')}
              />
              <Input
                name="opposingCounsel"
                label="Opposing Counsel"
                className="sm:col-span-2"
                placeholder="Firm or attorney representing the opposing party"
                value={values.opposingCounsel}
                error={errors.opposingCounsel}
                onChange={(event) => setField('opposingCounsel', event.target.value)}
                onBlur={() => blurField('opposingCounsel')}
              />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Classification"
            icon={Tags}
            bodyClassName="space-y-5 px-5 py-5"
          >
            <Select
              name="status"
              label="Initial Status"
              required
              placeholder="Select a status"
              options={caseStatusOptions}
              value={values.status}
              error={errors.status}
              onChange={(event) => setField('status', event.target.value)}
              onBlur={() => blurField('status')}
            />

            <ChoiceChips<CasePriority>
              label="Case Priority"
              required
              value={values.priority}
              options={casePriorityOptions.map((option) => ({
                value: option.value as CasePriority,
                label: option.label,
              }))}
              onChange={(value) => setField('priority', value)}
              error={errors.priority}
            />
          </SectionCard>

          <SectionCard
            title="Assignment"
            icon={Users}
            bodyClassName="space-y-5 px-5 py-5"
          >
            <PersonPicker
              label="Assigned Lead Counsel"
              placeholder="Select lead attorney…"
              queryKey="case-lawyer-picker"
              fetchPeople={(search) => caseService.getAssignableLawyers(search)}
              selectedName={values.leadLawyerName}
              onSelect={form.setLeadLawyer}
              emptyMessage="No assignable team members are available yet."
            />

            <div className="space-y-2">
              <PersonPicker
                label="Internal Team Members"
                placeholder="Add team member…"
                queryKey="case-team-picker"
                fetchPeople={(search) => caseService.getAssignableLawyers(search)}
                selectedName=""
                resetOnSelect
                onSelect={(person) => {
                  if (person) form.addTeamMember(person)
                }}
                emptyMessage="No assignable team members are available yet."
              />

              {values.teamMemberIds.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {values.teamMemberIds.map((id, index) => (
                    <li key={id}>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-soft px-2.5 py-1 text-xs font-semibold text-blue">
                        {values.teamMemberNames[index] ?? id}
                        <button
                          type="button"
                          onClick={() => form.removeTeamMember(id)}
                          aria-label={`Remove ${values.teamMemberNames[index] ?? 'team member'}`}
                          className="rounded-full p-0.5 transition hover:bg-blue/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard
            title="Milestones"
            icon={CalendarClock}
            bodyClassName="space-y-4 px-5 py-5"
          >
            <Input
              name="filingDate"
              label="Filing Date"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={values.filingDate}
              error={errors.filingDate}
              onChange={(event) => setField('filingDate', event.target.value)}
              onBlur={() => blurField('filingDate')}
            />
            <Input
              name="nextHearingAt"
              label="Next Hearing"
              type="date"
              value={values.nextHearingAt}
              error={errors.nextHearingAt}
              onChange={(event) => setField('nextHearingAt', event.target.value)}
              onBlur={() => blurField('nextHearingAt')}
            />
            <Input
              name="filingDeadline"
              label="Filing Deadline"
              type="date"
              required
              hint="Mandatory for procedural compliance."
              value={values.filingDeadline}
              error={errors.filingDeadline}
              onChange={(event) => setField('filingDeadline', event.target.value)}
              onBlur={() => blurField('filingDeadline')}
            />
          </SectionCard>

          <Card className="flex gap-3 bg-surface-muted p-4">
            <UserRound className="mt-0.5 size-4 shrink-0 text-blue" />
            <p className="text-xs leading-relaxed text-text-secondary">
              Assignment and milestone changes are recorded on the case timeline for
              audit purposes.
            </p>
          </Card>
        </div>
      </div>

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
          {isValid ? (
            <span>All required fields are complete.</span>
          ) : (
            <span>Complete the required fields to create this case.</span>
          )}
          {showDraftActions && draftSavedAt ? (
            <Badge variant="neutral">
              Draft saved {formatRelativeTime(draftSavedAt)}
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          {showDraftActions && onSaveDraft ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onSaveDraft}
              disabled={saving || !form.isDirty}
            >
              Save Draft
            </Button>
          ) : null}
          <Button type="submit" disabled={!isValid} loading={saving}>
            {submitLabel}
          </Button>
        </div>
      </Card>
    </form>
  )
}
