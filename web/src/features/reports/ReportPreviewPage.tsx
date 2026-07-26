import {
  AlertCircle,
  CalendarClock,
  FileText,
  Link2,
  Pencil,
  Printer,
  Share2,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Badge } from '@/shared/components/Badge'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/EmptyState'
import { InfoCard } from '@/shared/components/InfoCard'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatDateTime, formatMoney, formatShortDate } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import { ChartContainer } from './components/ChartContainer'
import { ReportsAreaChart } from './components/charts/ReportsAreaChart'
import { ReportsDonutChart } from './components/charts/ReportsDonutChart'
import { ReportsPieChart } from './components/charts/ReportsPieChart'
import { DeleteReportDialog } from './components/DeleteReportDialog'
import { ExportMenu } from './components/ExportMenu'
import { ReportBuilderSkeleton } from './components/ReportsSkeletons'
import { ScheduleReportModal } from './components/ScheduleReportModal'
import {
  useReportDetails,
  useReportsMutations,
} from './hooks/useReportsQueries'
import {
  dataSourceLabels,
  groupByLabels,
  reportCategoryLabels,
  reportCategoryVariants,
  reportTypeLabels,
  sortByLabels,
} from './lib/labels'
import type { ExportFormat, ReportPreviewRow, ScheduleReportPayload } from './types'

export function ReportPreviewPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const { report, state, refetch } = useReportDetails(reportId)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareRecipients, setShareRecipients] = useState('')

  const {
    deleteReport,
    exportReport,
    scheduleReport,
    shareReport,
    isDeleting,
    isExporting,
    isScheduling,
  } = useReportsMutations({
    onDeleted: () => navigate('/reports/library', { replace: true }),
    onScheduled: () => setScheduleOpen(false),
  })

  if (state === 'loading') {
    return (
      <>
        <TopBar title="Report preview" subtitle="Loading report…" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <ReportBuilderSkeleton />
        </div>
      </>
    )
  }

  if (state === 'error') {
    return (
      <>
        <TopBar title="Report preview" subtitle="Report details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load report"
            description="Something went wrong while loading this report."
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

  if (state === 'empty' || report === null) {
    return (
      <>
        <TopBar title="Report preview" subtitle="Report details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={FileText}
            title="Report not found"
            description="Select a report from the library or generate a new one."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => navigate('/reports/builder')}>
                  Generate report
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/reports/library')}
                >
                  Browse library
                </Button>
              </div>
            }
          />
        </div>
      </>
    )
  }

  const current = report

  const columns: DataTableColumn<ReportPreviewRow>[] = [
    {
      id: 'ref',
      header: 'Ref ID',
      render: (row) => (
        <span className="font-mono text-xs text-blue">{row.refId}</span>
      ),
    },
    {
      id: 'client',
      header: 'Client',
      render: (row) => (
        <span className="font-semibold text-navy">{row.clientName}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => <Badge variant="neutral">{row.status}</Badge>,
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
  ]

  function handleExport(format: ExportFormat) {
    exportReport.mutate({ id: current.id, format })
  }

  function handleSchedule(payload: ScheduleReportPayload) {
    scheduleReport.mutate({ reportId: current.id, payload })
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied', 'Share this report with your team.')
    } catch {
      toast.error('Could not copy link', 'Clipboard access was denied.')
    }
  }

  return (
    <>
      <TopBar
        title={report.name}
        subtitle={`${reportTypeLabels[report.type]} · ${reportCategoryLabels[report.category]}`}
        actions={
          <>
            <ExportMenu
              formats={report.formats}
              exporting={isExporting}
              onExport={handleExport}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.print()}
            >
              <Printer className="size-4" />
              Print
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShareOpen(true)}
            >
              <Share2 className="size-4" />
              Share
            </Button>
            <Button size="sm" onClick={() => setScheduleOpen(true)}>
              <CalendarClock className="size-4" />
              Schedule
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { label: 'Reports', to: '/reports' },
              { label: 'Library', to: '/reports/library' },
              { label: report.name },
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/reports/builder/${report.id}`)}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-danger hover:bg-danger/10"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={reportCategoryVariants[report.category]}>
            {reportCategoryLabels[report.category]}
          </Badge>
          <Badge variant="neutral">{reportTypeLabels[report.type]}</Badge>
          {report.lastRunAt ? (
            <span className="text-xs text-text-muted">
              Last run {formatDateTime(report.lastRunAt)}
            </span>
          ) : null}
        </div>

        {report.summary ? (
          <SectionCard title="Summary">
            <p className="text-sm leading-relaxed text-text-secondary">
              {report.summary}
            </p>
          </SectionCard>
        ) : (
          <SectionCard title="Summary">
            <p className="text-sm text-text-secondary">
              No written summary is available for this report yet.
            </p>
          </SectionCard>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {report.statistics.length === 0 ? (
            <Card className="p-4 text-sm text-text-secondary sm:col-span-2 xl:col-span-4">
              Statistics will appear here after the report has been run against
              live data.
            </Card>
          ) : (
            report.statistics.map((stat) => (
              <Card key={stat.label} className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-2xl text-navy">
                  {stat.currency
                    ? formatMoney(stat.amount, stat.currency)
                    : formatMoney(stat.amount)}
                </p>
              </Card>
            ))
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartContainer
            title="Revenue trend"
            empty={report.charts.revenueTrend.length === 0}
            emptyTitle="No chart data"
            emptyDescription="Trend charts appear once this report returns time-series results."
          >
            <ReportsAreaChart
              data={report.charts.revenueTrend}
              currency
            />
          </ChartContainer>
          <ChartContainer
            title="Practice area"
            empty={report.charts.practiceArea.length === 0}
            emptyTitle="No practice mix"
            emptyDescription="Practice area charts appear once categorized amounts are available."
            heightClassName="h-72"
          >
            <ReportsDonutChart data={report.charts.practiceArea} />
          </ChartContainer>
        </div>

        <ChartContainer
          title="Case distribution"
          empty={report.charts.caseDistribution.length === 0}
          emptyTitle="No distribution data"
          emptyDescription="Case distribution will appear when the report includes status totals."
        >
          <ReportsPieChart data={report.charts.caseDistribution} />
        </ChartContainer>

        <SectionCard title="Results table" bodyClassName="px-2 py-2">
          <DataTable
            caption="Report results"
            columns={columns}
            rows={report.rows}
            rowKey={(row) => row.id}
            empty={
              <EmptyState
                icon={FileText}
                title="No result rows"
                description="Run this report once data is available to populate the results table."
                className="border-0 py-10"
              />
            }
          />
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <InfoCard
            title="Filters applied"
            items={[
              {
                label: 'Date range',
                value:
                  report.filters.startDate && report.filters.endDate
                    ? `${formatShortDate(report.filters.startDate)} – ${formatShortDate(report.filters.endDate)}`
                    : '—',
              },
              {
                label: 'Data sources',
                value:
                  report.filters.dataSources
                    .map((source) => dataSourceLabels[source])
                    .join(', ') || '—',
              },
              {
                label: 'Group by',
                value: groupByLabels[report.filters.groupBy],
              },
              {
                label: 'Sort',
                value: `${sortByLabels[report.filters.sortBy]} (${report.filters.sortDir})`,
              },
            ]}
          />
          <InfoCard
            title="Metadata"
            items={[
              { label: 'Created by', value: report.createdBy },
              {
                label: 'Created',
                value: formatDateTime(report.createdAt),
              },
              {
                label: 'Updated',
                value: formatDateTime(report.updatedAt),
              },
              ...Object.entries(report.metadata).map(([label, value]) => ({
                label,
                value,
              })),
            ]}
          />
        </div>
      </div>

      <DeleteReportDialog
        open={deleteOpen}
        reportName={report.name}
        deleting={isDeleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => deleteReport.mutate(report.id)}
      />

      <ScheduleReportModal
        open={scheduleOpen}
        reportName={report.name}
        saving={isScheduling}
        onClose={() => setScheduleOpen(false)}
        onSave={handleSchedule}
      />

      <Modal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share report"
        description="Recipients receive a link. Delivery is backend-ready."
        footer={
          <>
            <Button variant="ghost" onClick={() => setShareOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={copyLink}>
              <Link2 className="size-4" />
              Copy link
            </Button>
            <Button
              loading={shareReport.isPending}
              onClick={() => {
                const recipients = shareRecipients
                  .split(',')
                  .map((part) => part.trim())
                  .filter(Boolean)
                if (recipients.length === 0) {
                  toast.error(
                    'Recipients required',
                    'Enter at least one email address.',
                  )
                  return
                }
                shareReport.mutate(
                  { id: report.id, recipients },
                  { onSuccess: () => setShareOpen(false) },
                )
              }}
            >
              <Share2 className="size-4" />
              Send
            </Button>
          </>
        }
      >
        <Input
          label="Recipients"
          value={shareRecipients}
          onChange={(event) => setShareRecipients(event.target.value)}
          placeholder="partner@firm.com, client@example.com"
          hint="Separate emails with commas."
        />
      </Modal>
    </>
  )
}
