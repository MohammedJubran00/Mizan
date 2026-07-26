import { AlertCircle, ArrowLeft, Briefcase, FileClock } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { formatRelativeTime } from '@/shared/lib/utils'
import { useCaseDraftStore } from '@/stores/caseDraftStore'
import { toast } from '@/stores/toastStore'

import { CaseForm } from './components/CaseForm'
import { CaseFormSkeleton } from './components/CaseSkeletons'
import { useCaseForm } from './hooks/useCaseForm'
import { useCaseDetails, useCaseMutations } from './hooks/useCaseQueries'
import {
  emptyCaseFormValues,
  toCaseFormValues,
  toCasePayload,
  type CaseFormValues,
} from './lib/caseForm'
import type { CaseDetails } from './types'

interface CaseFormPageProps {
  mode: 'create' | 'edit'
}

export function CaseFormPage({ mode }: CaseFormPageProps) {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const draft = useCaseDraftStore((s) => s.draft)
  const draftSavedAt = useCaseDraftStore((s) => s.savedAt)

  const { caseDetails, state, refetch } = useCaseDetails(
    mode === 'edit' ? caseId : undefined,
  )

  if (mode === 'create') {
    return (
      <CaseFormEditor
        mode="create"
        initialValues={draft ?? emptyCaseFormValues}
        restoredDraftAt={draft ? draftSavedAt : null}
      />
    )
  }

  if (state === 'loading') {
    return (
      <>
        <TopBar title="Edit Case" subtitle="Loading matter…" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <CaseFormSkeleton />
        </div>
      </>
    )
  }

  if (state === 'error') {
    return (
      <>
        <TopBar title="Edit Case" subtitle="Update matter details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load case"
            description="We were unable to load this matter for editing. Please try again."
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

  if (caseDetails === null) {
    return (
      <>
        <TopBar title="Edit Case" subtitle="Update matter details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={Briefcase}
            title="Case not found"
            description="This matter no longer exists or you do not have access to it."
            action={
              <Button variant="secondary" onClick={() => navigate('/cases')}>
                <ArrowLeft className="size-4" />
                Back to cases
              </Button>
            }
          />
        </div>
      </>
    )
  }

  return (
    <CaseFormEditor
      key={caseDetails.id}
      mode="edit"
      caseDetails={caseDetails}
      initialValues={toCaseFormValues(caseDetails)}
      restoredDraftAt={null}
    />
  )
}

interface CaseFormEditorProps {
  mode: 'create' | 'edit'
  caseDetails?: CaseDetails
  initialValues: CaseFormValues
  restoredDraftAt: string | null
}

function CaseFormEditor({
  mode,
  caseDetails,
  initialValues,
  restoredDraftAt,
}: CaseFormEditorProps) {
  const navigate = useNavigate()
  const form = useCaseForm(initialValues)
  const saveDraft = useCaseDraftStore((s) => s.saveDraft)
  const clearDraft = useCaseDraftStore((s) => s.clearDraft)
  const draftSavedAt = useCaseDraftStore((s) => s.savedAt)

  const [discardOpen, setDiscardOpen] = useState(false)
  const [draftNoticeVisible, setDraftNoticeVisible] = useState(
    restoredDraftAt !== null,
  )

  const isEdit = mode === 'edit' && caseDetails !== undefined
  const backTo = isEdit ? `/cases/${caseDetails.id}` : '/cases'

  const { createCase, updateCase, isCreating, isUpdating } = useCaseMutations({
    onCreated: (created) => {
      clearDraft()
      navigate(created ? `/cases/${created.id}` : '/cases', { replace: true })
    },
    onUpdated: () => navigate(backTo, { replace: true }),
  })

  const saving = isEdit ? isUpdating : isCreating

  function submit() {
    const payload = toCasePayload(form.values)

    if (isEdit) {
      updateCase.mutate({ id: caseDetails.id, payload })
      return
    }

    createCase.mutate(payload)
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
        title={isEdit ? 'Edit Case' : 'Create New Case'}
        subtitle={
          isEdit
            ? 'Update procedural details and team assignments.'
            : 'Initialise a new legal matter with full procedural details and team assignments.'
        }
        actions={
          <Button size="sm" variant="ghost" onClick={cancel}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Cases', to: '/cases' },
            ...(isEdit
              ? [
                  { label: caseDetails.caseNumber, to: `/cases/${caseDetails.id}` },
                  { label: 'Edit' },
                ]
              : [{ label: 'New Case Intake' }]),
          ]}
        />

        {draftNoticeVisible && restoredDraftAt ? (
          <Card className="flex flex-col gap-3 bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-text-secondary">
              <FileClock className="size-4 shrink-0 text-blue" />
              Unsaved draft restored from {formatRelativeTime(restoredDraftAt)}.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDraftNoticeVisible(false)}
              >
                Keep draft
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  clearDraft()
                  form.reset(emptyCaseFormValues)
                  setDraftNoticeVisible(false)
                  toast.info('Draft discarded', 'The intake form has been cleared.')
                }}
              >
                Discard draft
              </Button>
            </div>
          </Card>
        ) : null}

        <CaseForm
          form={form}
          saving={saving}
          submitLabel={isEdit ? 'Save Changes' : 'Create Case'}
          showDraftActions={!isEdit}
          draftSavedAt={isEdit ? null : draftSavedAt}
          onSaveDraft={() => {
            saveDraft(form.values)
            toast.success('Draft saved', 'You can finish this intake later.')
          }}
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
        Your unsaved edits to this matter will be lost.
        {!isEdit ? ' Use “Save Draft” first if you want to come back to it.' : ''}
      </ConfirmationDialog>
    </>
  )
}
