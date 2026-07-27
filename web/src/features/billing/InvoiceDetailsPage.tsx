import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Copy,
  Download,
  HelpCircle,
  Pencil,
  Plus,
  Receipt,
  Send,
  Trash2,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Badge } from '@/shared/components/Badge'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { TabPanel, Tabs, type TabItem } from '@/shared/components/Tabs'
import { formatShortDate } from '@/shared/lib/utils'

import { BalanceOverview } from './components/BalanceOverview'
import { InvoiceDetailsSkeleton } from './components/BillingSkeletons'
import { DeleteInvoiceDialog } from './components/DeleteInvoiceDialog'
import { InvoiceItemsTable } from './components/InvoiceItemsTable'
import { InvoiceTimeline } from './components/InvoiceTimeline'
import { RecordPaymentModal } from './components/RecordPaymentModal'
import { SendInvoiceDialog } from './components/SendInvoiceDialog'
import { ActivityTab } from './components/tabs/ActivityTab'
import { NotesTab } from './components/tabs/NotesTab'
import { OverviewExtras } from './components/tabs/OverviewExtras'
import { PaymentsTab } from './components/tabs/PaymentsTab'
import {
  useBillingMutations,
  useInvoiceDetails,
} from './hooks/useBillingQueries'
import {
  invoiceStatusLabels,
  invoiceStatusVariants,
  termsLabels,
} from './lib/labels'
import type { InvoiceListItem, SendInvoicePayload } from './types'

const TAB_IDS = ['overview', 'payments', 'activity', 'notes'] as const
type TabId = (typeof TAB_IDS)[number]

function isTabId(value: string | null): value is TabId {
  return value !== null && (TAB_IDS as readonly string[]).includes(value)
}

export function InvoiceDetailsPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { invoice, state, refetch } = useInvoiceDetails(invoiceId)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [voidOpen, setVoidOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [recordOpen, setRecordOpen] = useState(false)

  const {
    deleteInvoice,
    duplicateInvoice,
    voidInvoice,
    sendInvoice,
    downloadPdf,
    recordPayment,
    refundPayment,
    isDeleting,
    isSending,
    isDownloading,
    isRecordingPayment,
  } = useBillingMutations({
    onDeleted: () => navigate('/billing', { replace: true }),
    onDuplicated: (created) => {
      if (created) navigate(`/billing/invoices/${created.id}/edit`)
      else navigate('/billing/invoices/new')
    },
    onSent: () => setSendOpen(false),
    onPaymentRecorded: () => setRecordOpen(false),
  })

  const activeTab: TabId = isTabId(searchParams.get('tab'))
    ? (searchParams.get('tab') as TabId)
    : 'overview'

  const setActiveTab = useCallback(
    (tab: string) => {
      const next = new URLSearchParams(searchParams)
      if (tab === 'overview') next.delete('tab')
      else next.set('tab', tab)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  if (state === 'loading') {
    return (
      <>
        <TopBar title="Invoice" subtitle="Loading invoice…" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <InvoiceDetailsSkeleton />
        </div>
      </>
    )
  }

  if (state === 'error') {
    return (
      <>
        <TopBar title="Invoice" subtitle="Invoice details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load invoice"
            description="Something went wrong while loading this invoice. Please try again."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => refetch()}>
                  Retry
                </Button>
                <Button variant="ghost" onClick={() => navigate('/billing')}>
                  <ArrowLeft className="size-4" />
                  Back to billing
                </Button>
              </div>
            }
          />
        </div>
      </>
    )
  }

  if (state === 'empty' || invoice === null) {
    return (
      <>
        <TopBar title="Billing" subtitle="Invoice details" />
        <div className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: 'Invoices', to: '/billing' }, { label: 'Details' }]}
          />
          <EmptyState
            icon={Receipt}
            title="No invoice selected"
            description="Select an invoice from the billing dashboard to review line items, payments, and activity, or create a new invoice."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => navigate('/billing/invoices/new')}>
                  <Plus className="size-4" />
                  Create Invoice
                </Button>
                <Button variant="secondary" onClick={() => navigate('/billing')}>
                  Browse invoices
                </Button>
              </div>
            }
          />
        </div>
      </>
    )
  }

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'payments', label: 'Payments', count: invoice.payments?.length ?? 0 },
    { id: 'activity', label: 'Activity', count: invoice.activities?.length ?? 0 },
    { id: 'notes', label: 'Notes', count: invoice.notes?.length ?? 0 },
  ]

  const listItem: InvoiceListItem = {
    id: invoice.id,
    number: invoice.number,
    client: invoice.client,
    relatedCase: invoice.relatedCase,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    amount: invoice.balanceDue > 0 ? invoice.balanceDue : invoice.total,
    currency: invoice.currency,
    status: invoice.status,
    billingLawyer: invoice.billingLawyer,
  }

  function handleSend(payload: SendInvoicePayload) {
    sendInvoice.mutate({ id: listItem.id, payload })
  }

  return (
    <>
      <TopBar
        title={`Invoice ${invoice.number}`}
        subtitle={
          [invoice.client?.fullName, invoice.relatedCase?.title]
            .filter(Boolean)
            .join(' — ') || 'Invoice details'
        }
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              loading={isDownloading}
              onClick={() => downloadPdf.mutate(invoice.id)}
            >
              <Download className="size-4" />
              Download PDF
            </Button>
            <Button size="sm" onClick={() => setSendOpen(true)}>
              <Send className="size-4" />
              Send Invoice
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { label: 'Invoices', to: '/billing' },
              { label: invoice.number },
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/billing/invoices/${invoice.id}/edit`)}
              disabled={
                invoice.status === 'CANCELLED' ||
                invoice.status === 'VOID' ||
                invoice.status === 'PAID'
              }
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => duplicateInvoice.mutate(invoice.id)}
            >
              <Copy className="size-4" />
              Duplicate
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setVoidOpen(true)}
              disabled={
                invoice.status === 'CANCELLED' ||
                invoice.status === 'VOID' ||
                invoice.status === 'PAID'
              }
            >
              <Ban className="size-4" />
              Void
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-danger hover:bg-danger/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-navy">
            Invoice {invoice.number}
          </h1>
          <Badge variant={invoiceStatusVariants[invoice.status]}>
            {invoiceStatusLabels[invoice.status]}
          </Badge>
        </div>

        <Card className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCell label="Invoice date" value={formatShortDate(invoice.issueDate)} />
          <InfoCell
            label="Due date"
            value={
              invoice.dueDate ? formatShortDate(invoice.dueDate) : '—'
            }
            tone={invoice.status === 'OVERDUE' ? 'danger' : 'default'}
          />
          <InfoCell
            label="Billing lawyer"
            value={invoice.billingLawyer?.fullName ?? '—'}
          />
          <InfoCell label="Terms" value={termsLabels[invoice.terms]} />
        </Card>

        <Tabs
          idPrefix="invoice"
          items={tabs}
          value={activeTab}
          onChange={setActiveTab}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <TabPanel idPrefix="invoice" id="overview" active={activeTab === 'overview'}>
              <div className="space-y-6">
                <InvoiceItemsTable
                  items={invoice.items}
                  currency={invoice.currency}
                />
                <OverviewExtras
                  paymentInstructions={invoice.paymentInstructions}
                  caseSummary={invoice.caseSummary}
                />
              </div>
            </TabPanel>

            <TabPanel
              idPrefix="invoice"
              id="payments"
              active={activeTab === 'payments'}
            >
              <PaymentsTab
                payments={invoice.payments}
                currency={invoice.currency}
                onRecordPayment={() => setRecordOpen(true)}
                onRefund={(payment) => refundPayment.mutate(payment.id)}
              />
            </TabPanel>

            <TabPanel
              idPrefix="invoice"
              id="activity"
              active={activeTab === 'activity'}
            >
              <ActivityTab activities={invoice.activities} />
            </TabPanel>

            <TabPanel idPrefix="invoice" id="notes" active={activeTab === 'notes'}>
              <NotesTab notes={invoice.notes} />
            </TabPanel>
          </div>

          <div className="space-y-4">
            <BalanceOverview
              subtotal={invoice.subtotal}
              tax={invoice.tax}
              discount={invoice.discount}
              total={invoice.total}
              amountPaid={invoice.amountPaid}
              balanceDue={invoice.balanceDue}
              currency={invoice.currency}
            />
            <InvoiceTimeline events={invoice.timeline} />
            <Card className="flex items-center gap-3 p-4">
              <HelpCircle className="size-4 text-blue" />
              <a
                href="mailto:billing@example.com"
                className="text-sm font-medium text-blue hover:underline"
              >
                Contact billing support
              </a>
            </Card>
          </div>
        </div>
      </div>

      <DeleteInvoiceDialog
        open={deleteOpen}
        invoiceNumber={invoice.number}
        deleting={isDeleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => deleteInvoice.mutate(invoice.id)}
      />

      <ConfirmationDialog
        open={voidOpen}
        title="Void invoice?"
        confirmLabel="Void invoice"
        tone="danger"
        loading={voidInvoice.isPending}
        onCancel={() => setVoidOpen(false)}
        onConfirm={() => {
          voidInvoice.mutate(invoice.id, {
            onSuccess: () => setVoidOpen(false),
          })
        }}
      >
        Voiding{' '}
        <strong className="font-semibold text-navy">{invoice.number}</strong>{' '}
        marks it as uncollectible. This cannot be undone from the UI.
      </ConfirmationDialog>

      <SendInvoiceDialog
        open={sendOpen}
        invoice={invoice}
        sending={isSending}
        onClose={() => setSendOpen(false)}
        onSend={handleSend}
      />

      <RecordPaymentModal
        open={recordOpen}
        recording={isRecordingPayment}
        initialInvoice={listItem}
        onClose={() => setRecordOpen(false)}
        onRecord={(payload) => recordPayment.mutate(payload)}
      />
    </>
  )
}

function InfoCell({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'danger'
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p
        className={
          tone === 'danger'
            ? 'mt-1 text-sm font-semibold text-danger'
            : 'mt-1 text-sm font-semibold text-navy'
        }
      >
        {value}
      </p>
    </div>
  )
}
