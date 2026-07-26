import { AlertCircle, ArrowLeft, Gavel } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { EmptyState } from '@/shared/components/EmptyState'

import { HearingFormSkeleton } from './components/HearingSkeletons'
import { ScheduleForm } from './components/ScheduleForm'
import { useHearingForm } from './hooks/useHearingForm'
import { useHearingDetails, useHearingMutations } from './hooks/useHearingQueries'
import {
  emptyHearingFormValues,
  toHearingFormValues,
  toHearingPayload,
  type HearingFormValues,
} from './lib/hearingForm'
import type { HearingDetails } from './types'

interface HearingFormPageProps {
  mode: 'create' | 'edit'
}

export function HearingFormPage({ mode }: HearingFormPageProps) {
  const { hearingId } = useParams<{ hearingId: string }>()
  const navigate = useNavigate()

  const { hearing, state, refetch } = useHearingDetails(
    mode === 'edit' ? hearingId : undefined,
  )

  if (mode === 'create') {
    return (
      <HearingFormEditor mode="create" initialValues={emptyHearingFormValues} />
    )
  }

  if (state === 'loading') {
    return (
      <>
        <TopBar title="Edit Hearing" subtitle="Loading hearing…" />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <HearingFormSkeleton />
        </div>
      </>
    )
  }

  if (state === 'error') {
    return (
      <>
        <TopBar title="Edit Hearing" subtitle="Update hearing details" />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load hearing"
            description="We were unable to load this hearing for editing."
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

  if (hearing === null) {
    return (
      <>
        <TopBar title="Edit Hearing" subtitle="Update hearing details" />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={Gavel}
            title="Hearing not found"
            description="This hearing no longer exists or you do not have access to it."
            action={
              <Button variant="secondary" onClick={() => navigate('/hearings')}>
                <ArrowLeft className="size-4" />
                Back to hearings
              </Button>
            }
          />
        </div>
      </>
    )
  }

  return (
    <HearingFormEditor
      key={hearing.id}
      mode="edit"
      hearing={hearing}
      initialValues={toHearingFormValues(hearing)}
    />
  )
}

interface HearingFormEditorProps {
  mode: 'create' | 'edit'
  hearing?: HearingDetails
  initialValues: HearingFormValues
}

function HearingFormEditor({
  mode,
  hearing,
  initialValues,
}: HearingFormEditorProps) {
  const navigate = useNavigate()
  const form = useHearingForm(initialValues)
  const [discardOpen, setDiscardOpen] = useState(false)

  const isEdit = mode === 'edit' && hearing !== undefined
  const backTo = isEdit ? `/hearings/${hearing.id}` : '/hearings'

  const { createHearing, updateHearing, isCreating, isUpdating } =
    useHearingMutations({
      onCreated: (created) =>
        navigate(created ? `/hearings/${created.id}` : '/hearings', {
          replace: true,
        }),
      onUpdated: () => navigate(backTo, { replace: true }),
    })

  const saving = isEdit ? isUpdating : isCreating

  function submit() {
    const payload = toHearingPayload(form.values)
    if (isEdit) {
      updateHearing.mutate({ id: hearing.id, payload })
      return
    }
    createHearing.mutate(payload)
  }

  function cancel() {
    if (form.isDirty) {
      setDiscardOpen(true)
      return
    }
    navigate(backTo)
  }

  return (
    <>
      <TopBar
        title={isEdit ? 'Edit Hearing' : 'Schedule Professional Hearing'}
        subtitle={
          isEdit
            ? 'Update court, schedule, and assignment details.'
            : 'Complete the form below to register a new court hearing within the case file.'
        }
        actions={
          <Button size="sm" variant="ghost" onClick={cancel}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Hearings', to: '/hearings' },
            ...(isEdit
              ? [
                  { label: hearingTypeLabel(hearing), to: `/hearings/${hearing.id}` },
                  { label: 'Edit' },
                ]
              : [{ label: 'Schedule New Hearing' }]),
          ]}
        />

        <ScheduleForm
          form={form}
          saving={saving}
          submitLabel={isEdit ? 'Save Changes' : 'Schedule Hearing'}
          onSubmit={submit}
          onCancel={cancel}
        />

        <p className="pb-4 text-center text-xs text-text-muted">
          All hearing entries are logged for compliance auditing.
        </p>
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
        Your unsaved edits to this hearing will be lost.
      </ConfirmationDialog>
    </>
  )
}

function hearingTypeLabel(hearing: HearingDetails) {
  return hearing.caseRef?.caseNumber ?? 'Hearing'
}
