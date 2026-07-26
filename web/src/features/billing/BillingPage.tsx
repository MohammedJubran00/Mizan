import {
  AlertCircle,
  Download,
  Filter,
  Plus,
  Receipt,
  Search,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { downloadCsv } from '@/shared/lib/csv'
import { toast } from '@/stores/toastStore'

import { BillingFilters } from './components/BillingFilters'
import { BillingInvoiceTable } from './components/BillingInvoiceTable'
import { BillingListSkeleton } from './components/BillingSkeletons'
import { BillingStats } from './components/BillingStats'
import { DeleteInvoiceDialog } from './components/DeleteInvoiceDialog'
import { PremiumUpgradeCard } from './components/PremiumUpgradeCard'
import { RecordPaymentModal } from './components/RecordPaymentModal'
import { RevenueChart } from './components/RevenueChart'
import { SendInvoiceDialog } from './components/SendInvoiceDialog'
import { useBillingListParams } from './hooks/useBillingListParams'
import {
  useBillingMutations,
  useBillingSummary,
  useInvoiceList,
  useRevenueProjection,
} from './hooks/useBillingQueries'
import { invoiceStatusLabels } from './lib/labels'
import type { InvoiceListItem, SendInvoicePayload } from './types'

const EXPORT_HEADERS = [
  'Invoice number',
  'Client',
  'Related case',
  'Issue date',
  'Amount',
  'Currency',
  'Status',
]

function toExportRow(item: InvoiceListItem) {
  return [
    item.number,
    item.client?.fullName ?? '',
    item.relatedCase
      ? `${item.relatedCase.caseNumber} ${item.relatedCase.title}`
      : '',
    item.issueDate,
    item.amount,
    item.currency,
    invoiceStatusLabels[item.status],
  ]
}

export function BillingPage() {
  const navigate = useNavigate()
  const listParams = useBillingListParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { items, pagination, state, isSearching, refetch } = useInvoiceList(
    listParams.params,
  )
  const { summary, isLoading: summaryLoading } = useBillingSummary()
  const { points, isLoading: projectionLoading } = useRevenueProjection()

  const [pendingDelete, setPendingDelete] = useState<InvoiceListItem | null>(
    null,
  )
  const [sendTarget, setSendTarget] = useState<InvoiceListItem | null>(null)
  const [recordOpen, setRecordOpen] = useState(false)

  const {
    deleteInvoice,
    duplicateInvoice,
    markInvoicePaid,
    voidInvoice,
    sendInvoice,
    downloadPdf,
    recordPayment,
    isDeleting,
    isSending,
    isDownloading,
    isRecordingPayment,
  } = useBillingMutations({
    onDeleted: () => setPendingDelete(null),
    onSent: () => setSendTarget(null),
    onPaymentRecorded: () => setRecordOpen(false),
    onDuplicated: (invoice) => {
      if (invoice) navigate(`/billing/invoices/${invoice.id}/edit`)
      else navigate('/billing/invoices/new')
    },
  })

  const statusTabs = useMemo(
    () =>
      [
        { value: 'ALL' as const, label: 'All' },
        { value: 'PAID' as const, label: 'Paid' },
        { value: 'SENT' as const, label: 'Pending' },
      ] as const,
    [],
  )

  function exportRows(rows: InvoiceListItem[]) {
    if (rows.length === 0) {
      toast.info('Nothing to export', 'There are no invoices matching this view.')
      return
    }
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`invoices-${stamp}.csv`, EXPORT_HEADERS, rows.map(toExportRow))
    toast.success(
      'Export ready',
      `${rows.length} ${rows.length === 1 ? 'invoice' : 'invoices'} exported as CSV.`,
    )
  }

  function handleSend(payload: SendInvoicePayload) {
    if (!sendTarget) return
    sendInvoice.mutate({ id: sendTarget.id, payload })
  }

  return (
    <>
      <TopBar
        title="Billing & Payments"
        subtitle="Manage invoices, track payments, and monitor firm revenue."
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setFiltersOpen((value) => !value)}
            >
              <Filter className="size-4" />
              Filter
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => exportRows(items)}
              disabled={items.length === 0}
            >
              <Download className="size-4" />
              Export
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/billing/payments')}
            >
              <Wallet className="size-4" />
              Payments
            </Button>
            <Button size="sm" onClick={() => navigate('/billing/invoices/new')}>
              <Plus className="size-4" />
              Create Invoice
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <BillingStats summary={summary} loading={summaryLoading} />

        <BillingFilters
          search={listParams.searchInput}
          status={listParams.status}
          searching={isSearching}
          hasActiveFilters={listParams.hasActiveFilters}
          filtersOpen={filtersOpen}
          onSearchChange={listParams.setSearchInput}
          onStatusChange={listParams.setStatus}
          onToggleFilters={() => setFiltersOpen((value) => !value)}
          onReset={listParams.reset}
        />

        {state === 'loading' ? <BillingListSkeleton /> : null}

        {state === 'error' ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load invoices"
            description="Something went wrong while loading billing data. Please try again."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : null}

        {state === 'empty' || state === 'ready' ? (
          <BillingInvoiceTable
            items={items}
            pagination={pagination}
            onPageChange={listParams.setPage}
            onView={(item) => navigate(`/billing/invoices/${item.id}`)}
            onEdit={(item) => navigate(`/billing/invoices/${item.id}/edit`)}
            onDuplicate={(item) => duplicateInvoice.mutate(item.id)}
            onDownload={(item) => downloadPdf.mutate(item.id)}
            onSend={(item) => setSendTarget(item)}
            onMarkPaid={(item) => markInvoicePaid.mutate(item.id)}
            onVoid={(item) => voidInvoice.mutate(item.id)}
            onDelete={(item) => setPendingDelete(item)}
            headerAction={
              <div
                className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface-muted/50 p-1"
                role="tablist"
                aria-label="Invoice status filter"
              >
                {statusTabs.map((tab) => {
                  const active = listParams.status === tab.value
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => listParams.setStatus(tab.value)}
                      className={
                        active
                          ? 'rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-sm'
                          : 'rounded-md px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-navy'
                      }
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            }
            empty={
              listParams.hasActiveFilters ? (
                <EmptyState
                  icon={Search}
                  title="No matching invoices"
                  description="No invoices match your current search and filters. Try widening them."
                  action={
                    <Button variant="secondary" onClick={listParams.reset}>
                      Clear filters
                    </Button>
                  }
                  className="m-4 border-0"
                />
              ) : (
                <EmptyState
                  icon={Receipt}
                  title="No invoices yet"
                  description="Create your first invoice to track billables, payments, and firm revenue in one place."
                  action={
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button onClick={() => navigate('/billing/invoices/new')}>
                        <Plus className="size-4" />
                        Create Invoice
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setRecordOpen(true)}
                      >
                        <Wallet className="size-4" />
                        Record Payment
                      </Button>
                    </div>
                  }
                  className="m-4 border-0"
                />
              )
            }
          />
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <RevenueChart
            points={points}
            loading={projectionLoading}
            currency={summary?.currency}
          />
          <div className="space-y-4">
            <PremiumUpgradeCard />
            <Card className="space-y-3 p-5">
              <h3 className="text-sm font-semibold text-navy">Quick links</h3>
              <div className="flex flex-col gap-2">
                <Link
                  to="/billing/payments"
                  className="text-sm font-medium text-blue hover:underline"
                >
                  Open payments workflow
                </Link>
                <button
                  type="button"
                  className="text-left text-sm font-medium text-blue hover:underline disabled:opacity-50"
                  disabled={isDownloading}
                  onClick={() =>
                    toast.info(
                      'Select an invoice',
                      'Use the row menu to download a specific invoice PDF.',
                    )
                  }
                >
                  Download PDF help
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <DeleteInvoiceDialog
        open={pendingDelete !== null}
        invoiceNumber={pendingDelete?.number ?? ''}
        deleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteInvoice.mutate(pendingDelete.id)
        }}
      />

      <SendInvoiceDialog
        open={sendTarget !== null}
        invoice={sendTarget}
        sending={isSending}
        onClose={() => setSendTarget(null)}
        onSend={handleSend}
      />

      <RecordPaymentModal
        open={recordOpen}
        recording={isRecordingPayment}
        onClose={() => setRecordOpen(false)}
        onRecord={(payload) => recordPayment.mutate(payload)}
      />
    </>
  )
}
