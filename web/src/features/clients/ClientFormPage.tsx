import { AlertCircle, ArrowLeft, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { EmptyState } from '@/shared/components/EmptyState'

import { ClientForm } from './components/ClientForm'
import { ClientFormSkeleton } from './components/ClientSkeletons'
import { useClientForm } from './hooks/useClientForm'
import { useClientDetails, useClientMutations } from './hooks/useClientQueries'
import {
  emptyClientFormValues,
  toClientFormValues,
  toClientPayload,
  type ClientFormValues,
} from './lib/clientForm'
import type { ClientDetails } from './types'

interface ClientFormPageProps {
  mode: 'create' | 'edit'
}

export function ClientFormPage({ mode }: ClientFormPageProps) {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()

  const { client, state, refetch } = useClientDetails(
    mode === 'edit' ? clientId : undefined,
  )

  if (mode === 'create') {
    return <ClientFormEditor mode="create" initialValues={emptyClientFormValues} />
  }

  if (state === 'loading') {
    return (
      <>
        <TopBar title="Edit Client" subtitle="Loading client profile…" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <ClientFormSkeleton />
        </div>
      </>
    )
  }

  if (state === 'error') {
    return (
      <>
        <TopBar title="Edit Client" subtitle="Update client details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load client"
            description="We were unable to load this client profile for editing. Please try again."
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

  if (client === null) {
    return (
      <>
        <TopBar title="Edit Client" subtitle="Update client details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={UserRound}
            title="Client not found"
            description="This client no longer exists or you do not have access to it."
            action={
              <Button variant="secondary" onClick={() => navigate('/clients')}>
                <ArrowLeft className="size-4" />
                Back to clients
              </Button>
            }
          />
        </div>
      </>
    )
  }

  return (
    <ClientFormEditor
      key={client.id}
      mode="edit"
      client={client}
      initialValues={toClientFormValues(client)}
    />
  )
}

interface ClientFormEditorProps {
  mode: 'create' | 'edit'
  client?: ClientDetails
  initialValues: ClientFormValues
}

function ClientFormEditor({ mode, client, initialValues }: ClientFormEditorProps) {
  const navigate = useNavigate()
  const form = useClientForm(initialValues)
  const [discardOpen, setDiscardOpen] = useState(false)

  const { createClient, updateClient, isSaving } = useClientMutations({
    onCreated: (created) =>
      navigate(created ? `/clients/${created.id}` : '/clients', { replace: true }),
    onUpdated: () =>
      navigate(client ? `/clients/${client.id}` : '/clients', { replace: true }),
  })

  const isEdit = mode === 'edit' && client !== undefined
  const backTo = isEdit ? `/clients/${client.id}` : '/clients'

  function submit() {
    const payload = toClientPayload(form.values)

    if (isEdit) {
      updateClient.mutate({ id: client.id, payload })
      return
    }

    createClient.mutate(payload)
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
        title={isEdit ? 'Edit Client' : 'New Client'}
        subtitle={
          isEdit
            ? 'Update the client profile and keep records accurate.'
            : 'Establish a new client profile within your workspace.'
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
            { label: 'Clients', to: '/clients' },
            ...(isEdit
              ? [
                  { label: client.fullName, to: `/clients/${client.id}` },
                  { label: 'Edit' },
                ]
              : [{ label: 'New Client' }]),
          ]}
        />

        <ClientForm
          form={form}
          saving={isSaving}
          submitLabel={isEdit ? 'Save Changes' : 'Save Client'}
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
        Your unsaved edits to this client profile will be lost.
      </ConfirmationDialog>
    </>
  )
}
