import {
  AlertCircle,
  AlertTriangle,
  Download,
  Eye,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Badge } from '@/shared/components/Badge'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'
import { EmptyState } from '@/shared/components/EmptyState'
import { Modal } from '@/shared/components/Modal'
import { Pagination } from '@/shared/components/Pagination'
import { SearchBar } from '@/shared/components/SearchBar'
import { SectionCard } from '@/shared/components/SectionCard'
import { Select } from '@/shared/components/Select'
import { downloadCsv } from '@/shared/lib/csv'
import { formatMoney, formatPercent, formatShortDate } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import { RecordPaymentModal } from './components/RecordPaymentModal'
import {
  useBillingActions,
  useBillingMutations,
  usePaymentList,
  useRevenueInsights,
} from './hooks/useBillingQueries'
import { usePaymentListParams } from './hooks/usePaymentListParams'
import {
  PAYMENT_STATUS_FILTERS,
  paymentMethodLabels,
  paymentStatusLabels,
  paymentStatusVariants,
} from './lib/labels'
import type { Payment } from './types'

const EXPORT_HEADERS = [
  'Invoice',
  'Client',
  'Amount',
  'Currency',
  'Method',
  'Status',
  'Payment date',
  'Reference',
]

function toExportRow(item: Payment) {
  return [
    item.invoiceNumber,
    item.client?.fullName ?? '',
    item.amount,
    item.currency,
    paymentMethodLabels[item.method],
    paymentStatusLabels[item.status],
    item.paymentDate,
    item.referenceNumber ?? '',
  ]
}

export function PaymentsPage() {
  const navigate = useNavigate()
  const listParams = usePaymentListParams()
  const { items, pagination, state, isSearching, refetch } = usePaymentList(
    listParams.params,
  )
  const { insights, isLoading: insightsLoading } = useRevenueInsights()
  const { actions } = useBillingActions()

  const [recordOpen, setRecordOpen] = useState(false)
  const [viewPayment, setViewPayment] = useState<Payment | null>(null)

  const { recordPayment, refundPayment, isRecordingPayment } =
    useBillingMutations({
      onPaymentRecorded: () => setRecordOpen(false),
    })

  function exportRows(rows: Payment[]) {
    if (rows.length === 0) {
      toast.info('Nothing to export', 'There are no payments matching this view.')
      return
    }
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`payments-${stamp}.csv`, EXPORT_HEADERS, rows.map(toExportRow))
    toast.success(
      'Export ready',
      `${rows.length} ${rows.length === 1 ? 'payment' : 'payments'} exported as CSV.`,
    )
  }

  function buildMenu(item: Payment): DropdownMenuItem[] {
    return [
      {
        id: 'view',
        label: 'View payment',
        icon: Eye,
        onSelect: () => setViewPayment(item),
      },
      {
        id: 'invoice',
        label: 'Open invoice',
        icon: Wallet,
        onSelect: () => navigate(`/billing/invoices/${item.invoiceId}`),
      },
      {
        id: 'refund',
        label: 'Refund',
        icon: RotateCcw,
        tone: 'danger',
        disabled: item.status === 'REFUNDED',
        onSelect: () => refundPayment.mutate(item.id),
      },
    ]
  }

  const columns: DataTableColumn<Payment>[] = [
    {
      id: 'invoice',
      header: 'Invoice',
      render: (row) => (
        <Link
          to={`/billing/invoices/${row.invoiceId}`}
          className="font-semibold text-blue hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {row.invoiceNumber}
        </Link>
      ),
    },
    {
      id: 'client',
      header: 'Client',
      render: (row) => (
        <span className="text-text-secondary">
          {row.client?.fullName ?? '—'}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      className: 'hidden md:table-cell',
      render: (row) => (
        <span className="text-text-secondary">
          {formatShortDate(row.paymentDate)}
        </span>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (row) => (
        <span className="font-semibold text-navy">
          {formatMoney(row.amount, row.currency)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={paymentStatusVariants[row.status]}>
          {paymentStatusLabels[row.status]}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'w-12',
      render: (row) => (
        <div onClick={(event) => event.stopPropagation()}>
          <DropdownMenu
            triggerLabel={`Actions for payment on ${row.invoiceNumber}`}
            trigger={<MoreHorizontal className="size-4" />}
            items={buildMenu(row)}
          />
        </div>
      ),
    },
  ]

  return (
    <>
      <TopBar
        title="Billing workflows"
        subtitle="Record payments, review history, and monitor collection status."
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => exportRows(items)}
              disabled={items.length === 0}
            >
              <Download className="size-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => setRecordOpen(true)}>
              <Plus className="size-4" />
              Record Payment
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Billing', to: '/billing' },
            { label: 'Payment states' },
          ]}
        />

        <Card className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <SearchBar
                value={listParams.searchInput}
                onChange={listParams.setSearchInput}
                placeholder="Search invoices, clients…"
                ariaLabel="Search payments"
                searching={isSearching}
              />
            </div>
            <div className="w-full lg:w-48">
              <Select
                label="Status"
                options={PAYMENT_STATUS_FILTERS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                value={listParams.status}
                onChange={(event) =>
                  listParams.setStatus(
                    event.target.value as typeof listParams.status,
                  )
                }
              />
            </div>
            {listParams.hasActiveFilters ? (
              <Button size="sm" variant="ghost" onClick={listParams.reset}>
                Clear
              </Button>
            ) : null}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-4">
            {state === 'loading' ? (
              <Card className="space-y-4 p-8">
                <div className="mx-auto size-14 animate-pulse rounded-2xl bg-surface-muted" />
                <div className="mx-auto h-6 w-48 animate-pulse rounded bg-surface-muted" />
                <div className="mx-auto h-4 w-72 animate-pulse rounded bg-surface-muted" />
              </Card>
            ) : null}

            {state === 'error' ? (
              <EmptyState
                icon={AlertCircle}
                title="Could not load payments"
                description="Something went wrong while loading payment history. Please try again."
                action={
                  <Button variant="secondary" onClick={() => refetch()}>
                    Retry
                  </Button>
                }
              />
            ) : null}

            {state === 'empty' ? (
              listParams.hasActiveFilters ? (
                <EmptyState
                  icon={Search}
                  title="No matching payments"
                  description="No payments match your current search and filters."
                  action={
                    <Button variant="secondary" onClick={listParams.reset}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Wallet}
                  title="No payments recorded"
                  description="Start tracking your revenue by recording your first client payment. You can match payments to existing invoices or record deposits."
                  action={
                    <Button onClick={() => setRecordOpen(true)}>
                      <Plus className="size-4" />
                      Record Payment
                    </Button>
                  }
                />
              )
            ) : null}

            {state === 'ready' ? (
              <Card className="overflow-hidden">
                <div className="border-b border-border-subtle px-4 py-3">
                  <h2 className="text-sm font-semibold text-navy">
                    Payment history
                  </h2>
                </div>
                <DataTable
                  caption="Payment history"
                  columns={columns}
                  rows={items}
                  rowKey={(row) => row.id}
                  onRowClick={(row) => setViewPayment(row)}
                  empty={null}
                />
                {pagination ? (
                  <Pagination
                    page={pagination.page}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    totalPages={pagination.totalPages}
                    onPageChange={listParams.setPage}
                  />
                ) : null}
              </Card>
            ) : null}
          </div>

          <div className="space-y-4">
            <SectionCard title="Action required" icon={AlertTriangle}>
              {actions.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  No billing actions need your attention right now.
                </p>
              ) : (
                <ul className="space-y-3">
                  {actions.map((action) => (
                    <li
                      key={action.id}
                      className="rounded-xl border border-danger/20 bg-danger/5 p-3"
                    >
                      <div className="flex gap-2">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-navy">
                            {action.title}
                          </p>
                          <p className="mt-1 text-xs text-text-secondary">
                            {action.description}
                          </p>
                          {action.href ? (
                            <Link
                              to={action.href}
                              className="mt-2 inline-block text-xs font-semibold uppercase tracking-wide text-danger hover:underline"
                            >
                              Review
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <Card className="relative overflow-hidden bg-navy p-5 text-white">
              <TrendingUp
                className="pointer-events-none absolute -right-3 -top-3 size-24 text-white/10"
                strokeWidth={1}
                aria-hidden
              />
              <div className="relative space-y-3">
                <h3 className="text-sm font-semibold">Revenue insights</h3>
                <p className="font-display text-3xl">
                  {insightsLoading
                    ? '…'
                    : formatMoney(
                        insights?.totalCollected ?? 0,
                        insights?.currency ?? 'USD',
                      )}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                  {formatPercent(insights?.progressPercent ?? 0)} of quarterly
                  goal reached
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <RecordPaymentModal
        open={recordOpen}
        recording={isRecordingPayment}
        onClose={() => setRecordOpen(false)}
        onRecord={(payload) => recordPayment.mutate(payload)}
      />

      <PaymentDetailsDialog
        payment={viewPayment}
        onClose={() => setViewPayment(null)}
        onOpenInvoice={(id) => navigate(`/billing/invoices/${id}`)}
        onRefund={(id) => {
          refundPayment.mutate(id)
          setViewPayment(null)
        }}
      />
    </>
  )
}

function PaymentDetailsDialog({
  payment,
  onClose,
  onOpenInvoice,
  onRefund,
}: {
  payment: Payment | null
  onClose: () => void
  onOpenInvoice: (invoiceId: string) => void
  onRefund: (paymentId: string) => void
}) {
  return (
    <Modal
      open={payment !== null}
      onClose={onClose}
      title="Payment details"
      description={
        payment
          ? `${payment.invoiceNumber} · ${formatShortDate(payment.paymentDate)}`
          : undefined
      }
      footer={
        payment ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="secondary"
              onClick={() => onOpenInvoice(payment.invoiceId)}
            >
              Open invoice
            </Button>
            <Button
              variant="danger"
              disabled={payment.status === 'REFUNDED'}
              onClick={() => onRefund(payment.id)}
            >
              Refund
            </Button>
          </>
        ) : null
      }
    >
      {payment ? (
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">Amount</dt>
            <dd className="font-semibold text-navy">
              {formatMoney(payment.amount, payment.currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">Method</dt>
            <dd>{paymentMethodLabels[payment.method]}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">Status</dt>
            <dd>
              <Badge variant={paymentStatusVariants[payment.status]}>
                {paymentStatusLabels[payment.status]}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">Reference</dt>
            <dd>{payment.referenceNumber || '—'}</dd>
          </div>
          {payment.notes ? (
            <div>
              <dt className="text-text-muted">Notes</dt>
              <dd className="mt-1 text-text-secondary">{payment.notes}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </Modal>
  )
}
