import { AlertCircle, ArrowLeft, Info, Receipt } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { toast } from '@/stores/toastStore'

import { InvoiceFormSkeleton } from './components/BillingSkeletons'
import { InvoiceGeneralStep } from './components/InvoiceGeneralStep'
import { InvoiceItemsStep } from './components/InvoiceItemsStep'
import { InvoiceSummary } from './components/InvoiceSummary'
import { InvoiceWizardStepper } from './components/InvoiceWizardStepper'
import {
  useBillingMutations,
  useInvoiceDetails,
} from './hooks/useBillingQueries'
import { useInvoiceForm } from './hooks/useInvoiceForm'
import {
  emptyInvoiceFormValues,
  summarizeInvoiceForm,
  toInvoiceFormValues,
  toInvoicePayload,
  validateInvoiceForm,
  type InvoiceFormValues,
} from './lib/invoiceForm'

interface InvoiceFormPageProps {
  mode: 'create' | 'edit'
}

export function InvoiceFormPage({ mode }: InvoiceFormPageProps) {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const navigate = useNavigate()
  const { invoice, state, refetch } = useInvoiceDetails(
    mode === 'edit' ? invoiceId : undefined,
  )

  if (mode === 'create') {
    return (
      <InvoiceFormEditor mode="create" initialValues={emptyInvoiceFormValues} />
    )
  }

  if (state === 'loading') {
    return (
      <>
        <TopBar title="Edit invoice" subtitle="Loading invoice…" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <InvoiceFormSkeleton />
        </div>
      </>
    )
  }

  if (state === 'error') {
    return (
      <>
        <TopBar title="Edit invoice" subtitle="Update invoice details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load invoice"
            description="We were unable to load this invoice for editing. Please try again."
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

  if (invoice === null) {
    return (
      <>
        <TopBar title="Edit invoice" subtitle="Update invoice details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={Receipt}
            title="Invoice not found"
            description="This invoice no longer exists or you do not have access to it."
            action={
              <Button variant="secondary" onClick={() => navigate('/billing')}>
                <ArrowLeft className="size-4" />
                Back to billing
              </Button>
            }
          />
        </div>
      </>
    )
  }

  return (
    <InvoiceFormEditor
      mode="edit"
      invoiceId={invoice.id}
      initialValues={toInvoiceFormValues(invoice)}
    />
  )
}

function InvoiceFormEditor({
  mode,
  invoiceId,
  initialValues,
}: {
  mode: 'create' | 'edit'
  invoiceId?: string
  initialValues: InvoiceFormValues
}) {
  const navigate = useNavigate()
  const form = useInvoiceForm(initialValues)
  const [cancelOpen, setCancelOpen] = useState(false)

  const { createInvoice, updateInvoice, isSaving } = useBillingMutations({
    onCreated: (invoice) => {
      if (invoice) navigate(`/billing/invoices/${invoice.id}`, { replace: true })
      else navigate('/billing', { replace: true })
    },
    onUpdated: (invoice) => {
      if (invoice) navigate(`/billing/invoices/${invoice.id}`, { replace: true })
      else navigate('/billing', { replace: true })
    },
  })

  const totals = summarizeInvoiceForm(form.values)

  function submit(status: 'DRAFT' | 'SENT') {
    if (status === 'SENT' && form.step === 1) {
      form.goToItems()
      return
    }

    if (!form.validateAll()) {
      const nextErrors = validateInvoiceForm(form.values)
      if (nextErrors.itemErrors || nextErrors.items) {
        form.setStep(2)
      }
      return
    }

    const payload = toInvoicePayload(form.values, status)

    if (mode === 'edit' && invoiceId) {
      updateInvoice.mutate({ id: invoiceId, payload })
      return
    }

    createInvoice.mutate(payload)
  }

  function previewPdf() {
    toast.info(
      'PDF preview',
      'Preview will be available once the billing PDF endpoint is connected.',
    )
  }

  return (
    <>
      <TopBar
        title={mode === 'create' ? 'Create invoice' : 'Edit invoice'}
        subtitle="Build invoice details and line items for client billing."
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/billing')}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Invoices', to: '/billing' },
            {
              label:
                mode === 'create' ? 'Create new invoice' : 'Edit invoice',
            },
          ]}
        />

        <InvoiceWizardStepper
          step={form.step}
          onStepChange={(step) => {
            if (step === 1) form.goToGeneral()
            else form.goToItems()
          }}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            {form.step === 1 ? (
              <InvoiceGeneralStep form={form} />
            ) : (
              <InvoiceItemsStep
                form={form}
                saving={isSaving}
                onSaveDraft={() => submit('DRAFT')}
                onCreate={() => submit('SENT')}
              />
            )}
          </div>

          <div className="space-y-4">
            <InvoiceSummary
              subtotal={totals.subtotal}
              taxAmount={totals.taxAmount}
              discountAmount={totals.discountAmount}
              total={totals.total}
              currency={form.values.currency}
              previewing={false}
              onPreviewPdf={previewPdf}
              onCancel={() => setCancelOpen(true)}
            />

            <Card className="flex gap-2 border-dashed p-4 text-xs text-text-secondary">
              <Info className="mt-0.5 size-4 shrink-0 text-blue" />
              <p>
                Invoices stay in draft until you create or send them. Use the
                client, case, and lawyer pickers to link this invoice to your
                workspace records.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={cancelOpen}
        title="Cancel draft?"
        confirmLabel="Discard"
        tone="danger"
        onCancel={() => setCancelOpen(false)}
        onConfirm={() => navigate('/billing')}
      >
        Unsaved invoice details will be discarded and you will return to the
        billing dashboard.
      </ConfirmationDialog>
    </>
  )
}
