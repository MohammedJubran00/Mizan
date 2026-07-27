import { ArrowRight, BarChart3, Expand, Info, Table2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Badge } from '@/shared/components/Badge'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/EmptyState'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { formatMoney } from '@/shared/lib/utils'

import { DateRangePicker } from './components/DateRangePicker'
import { ReportBuilderSkeleton } from './components/ReportsSkeletons'
import { useReportBuilder } from './hooks/useReportBuilder'
import {
  useReportDetails,
  useReportPreview,
  useReportsMutations,
} from './hooks/useReportsQueries'
import {
  dataSourceLabels,
  exportFormatOptions,
  groupByOptions,
  reportTypeOptions,
  sortByOptions,
} from './lib/labels'
import {
  emptyReportBuilderValues,
  toReportBuilderValues,
  toReportPayload,
  allDataSources,
} from './lib/reportForm'
import type { ReportCategory, ReportPreviewRow } from './types'
import { REPORT_CATEGORIES } from './types'

interface ReportBuilderPageProps {
  mode?: 'create' | 'edit'
}

export function ReportBuilderPage({ mode = 'create' }: ReportBuilderPageProps) {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const isEdit = mode === 'edit' || Boolean(reportId)

  const { report, state } = useReportDetails(isEdit ? reportId : undefined)

  if (isEdit && state === 'loading') {
    return (
      <>
        <TopBar title="Edit report" subtitle="Loading report configuration…" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <ReportBuilderSkeleton />
        </div>
      </>
    )
  }

  if (isEdit && (state === 'empty' || report === null) && state !== 'loading') {
    return (
      <>
        <TopBar title="Edit report" subtitle="Report builder" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={BarChart3}
            title="Report not found"
            description="This report no longer exists or you do not have access to it."
            action={
              <Button variant="secondary" onClick={() => navigate('/reports/library')}>
                Back to library
              </Button>
            }
          />
        </div>
      </>
    )
  }

  return (
    <ReportBuilderEditor
      mode={isEdit ? 'edit' : 'create'}
      reportId={report?.id}
      initialValues={
        report ? toReportBuilderValues(report) : emptyReportBuilderValues
      }
    />
  )
}

function ReportBuilderEditor({
  mode,
  reportId,
  initialValues,
}: {
  mode: 'create' | 'edit'
  reportId?: string
  initialValues: ReturnType<typeof toReportBuilderValues>
}) {
  const navigate = useNavigate()
  const form = useReportBuilder(initialValues)
  const [previewMode, setPreviewMode] = useState<'table' | 'chart'>('table')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [autoSaving] = useState(true)

  const payload = useMemo(() => {
    if (!form.values.name.trim() || !form.values.type) return null
    try {
      return toReportPayload(form.values)
    } catch {
      return null
    }
  }, [form.values])

  const previewEnabled =
    Boolean(form.values.startDate) &&
    Boolean(form.values.endDate) &&
    form.values.dataSources.length > 0

  const { rows, state: previewState, isFetching } = useReportPreview(
    payload,
    previewEnabled,
  )

  const { generateReport, updateReport, isGenerating } = useReportsMutations({
    onGenerated: (report) => {
      if (report) navigate(`/reports/${report.id}`, { replace: true })
      else navigate('/reports/library', { replace: true })
    },
    onUpdated: (report) => {
      if (report) navigate(`/reports/${report.id}`, { replace: true })
      else navigate('/reports/library', { replace: true })
    },
  })

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
      header: 'Client name',
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
      id: 'branch',
      header: 'Branch',
      className: 'hidden md:table-cell',
      render: (row) => (
        <span className="text-text-secondary">{row.branch}</span>
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
  ]

  function submit() {
    if (!form.validate()) return
    const nextPayload = toReportPayload(form.values)
    if (mode === 'edit' && reportId) {
      updateReport.mutate({ id: reportId, payload: nextPayload })
      return
    }
    generateReport.mutate(nextPayload)
  }

  const categoryOptions = REPORT_CATEGORIES.map((value) => ({
    value,
    label: value.charAt(0) + value.slice(1).toLowerCase().replace('_', ' '),
  }))

  return (
    <>
      <TopBar
        title={mode === 'create' ? 'Build custom report' : 'Edit report'}
        subtitle="Configure data points and filtering criteria."
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 pb-28 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Reports', to: '/reports' },
            { label: 'Library', to: '/reports/library' },
            { label: mode === 'create' ? 'New report' : 'Edit' },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <Card className="space-y-6 p-5">
            <div>
              <h2 className="font-display text-xl text-navy">
                Build custom report
              </h2>
              <p className="mt-1 text-xs text-text-muted">
                Configure data points and filtering criteria.
              </p>
            </div>

            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                General information
              </h3>
              <Input
                label="Report name"
                required
                value={form.values.name}
                onChange={(event) => form.updateField('name', event.target.value)}
                onBlur={() => form.touchField('name')}
                error={form.fieldError('name')}
                placeholder="Q4 revenue summary"
              />
              <Select
                label="Report type"
                required
                options={reportTypeOptions}
                value={form.values.type}
                onChange={(event) =>
                  form.updateField(
                    'type',
                    event.target.value as typeof form.values.type,
                  )
                }
                error={form.fieldError('type')}
              />
              <Select
                label="Category"
                required
                options={categoryOptions}
                value={form.values.category}
                onChange={(event) =>
                  form.updateField(
                    'category',
                    event.target.value as ReportCategory,
                  )
                }
                error={form.fieldError('category')}
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Data scope
              </h3>
              <DateRangePicker
                startDate={form.values.startDate}
                endDate={form.values.endDate}
                onStartChange={(value) => form.updateField('startDate', value)}
                onEndChange={(value) => form.updateField('endDate', value)}
                startError={form.fieldError('startDate')}
                endError={form.fieldError('endDate')}
              />

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-text">
                  Data sources
                </legend>
                <div className="flex flex-wrap gap-2">
                  {allDataSources.map((source) => {
                    const active = form.values.dataSources.includes(source)
                    return (
                      <button
                        key={source}
                        type="button"
                        onClick={() => form.toggleSource(source)}
                        className={
                          active
                            ? 'rounded-lg border border-navy bg-navy px-3 py-1.5 text-xs font-semibold text-white'
                            : 'rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted'
                        }
                        aria-pressed={active}
                      >
                        {dataSourceLabels[source]}
                      </button>
                    )
                  })}
                </div>
                {form.fieldError('dataSources') ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {form.fieldError('dataSources')}
                  </p>
                ) : null}
              </fieldset>

              <Input
                label="Practice area"
                value={form.values.practiceArea}
                onChange={(event) =>
                  form.updateField('practiceArea', event.target.value)
                }
                placeholder="Optional filter"
              />
              <Input
                label="Lawyer"
                value={form.values.lawyerName}
                onChange={(event) => {
                  form.updateField('lawyerName', event.target.value)
                  form.updateField('lawyerId', event.target.value ? 'pending' : '')
                }}
                placeholder="Optional lawyer filter"
              />
              <Input
                label="Client"
                value={form.values.clientName}
                onChange={(event) => {
                  form.updateField('clientName', event.target.value)
                  form.updateField('clientId', event.target.value ? 'pending' : '')
                }}
                placeholder="Optional client filter"
              />
              <Input
                label="Case"
                value={form.values.caseLabel}
                onChange={(event) => {
                  form.updateField('caseLabel', event.target.value)
                  form.updateField('caseId', event.target.value ? 'pending' : '')
                }}
                placeholder="Optional case filter"
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Filters & sorting
              </h3>
              <Select
                label="Group by"
                options={groupByOptions}
                value={form.values.groupBy}
                onChange={(event) =>
                  form.updateField(
                    'groupBy',
                    event.target.value as typeof form.values.groupBy,
                  )
                }
              />
              <div className="grid grid-cols-[1fr_auto] items-end gap-2">
                <Select
                  label="Sort by"
                  options={sortByOptions}
                  value={form.values.sortBy}
                  onChange={(event) =>
                    form.updateField(
                      'sortBy',
                      event.target.value as typeof form.values.sortBy,
                    )
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  aria-label={`Sort ${form.values.sortDir === 'asc' ? 'ascending' : 'descending'}`}
                  onClick={() =>
                    form.updateField(
                      'sortDir',
                      form.values.sortDir === 'asc' ? 'desc' : 'asc',
                    )
                  }
                >
                  {form.values.sortDir === 'asc' ? 'Asc' : 'Desc'}
                </Button>
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-text">
                  Export formats
                </legend>
                <div className="flex flex-wrap gap-2">
                  {exportFormatOptions.map((option) => {
                    const active = form.values.formats.includes(
                      option.value as (typeof form.values.formats)[number],
                    )
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          form.toggleFormat(
                            option.value as (typeof form.values.formats)[number],
                          )
                        }
                        className={
                          active
                            ? 'rounded-lg border border-navy bg-navy px-3 py-1.5 text-xs font-semibold text-white'
                            : 'rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary'
                        }
                        aria-pressed={active}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
                {form.fieldError('formats') ? (
                  <p className="mt-1 text-xs text-danger">
                    {form.fieldError('formats')}
                  </p>
                ) : null}
              </fieldset>
            </section>
          </Card>

          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-navy">
                    Real-time preview
                  </h2>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Refined to top 50 matches based on criteria.
                    {isFetching ? ' Updating…' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="flex rounded-lg border border-border p-1"
                    role="tablist"
                    aria-label="Preview mode"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={previewMode === 'table'}
                      className={
                        previewMode === 'table'
                          ? 'inline-flex items-center gap-1 rounded-md bg-navy px-2.5 py-1.5 text-xs font-semibold text-white'
                          : 'inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-text-secondary'
                      }
                      onClick={() => setPreviewMode('table')}
                    >
                      <Table2 className="size-3.5" />
                      Table
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={previewMode === 'chart'}
                      className={
                        previewMode === 'chart'
                          ? 'inline-flex items-center gap-1 rounded-md bg-navy px-2.5 py-1.5 text-xs font-semibold text-white'
                          : 'inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-text-secondary'
                      }
                      onClick={() => setPreviewMode('chart')}
                    >
                      <BarChart3 className="size-3.5" />
                      Chart
                    </button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Expand preview"
                    onClick={() => {
                      if (mode === 'edit' && reportId) {
                        navigate(`/reports/${reportId}`)
                      }
                    }}
                  >
                    <Expand className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="p-2">
                {!previewEnabled ? (
                  <EmptyState
                    icon={Info}
                    title="Configure filters to preview"
                    description="Choose a date range and at least one data source to load a live preview."
                    className="border-0 py-12"
                  />
                ) : previewState === 'loading' ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-10 animate-pulse rounded-lg bg-surface-muted"
                      />
                    ))}
                  </div>
                ) : previewMode === 'chart' ? (
                  <EmptyState
                    icon={BarChart3}
                    title="Chart preview unavailable"
                    description="Generate the report to see detailed trend analysis and forecasting for the selected criteria."
                    className="border-0 py-12"
                  />
                ) : previewState === 'empty' ? (
                  <EmptyState
                    icon={Table2}
                    title="No preview rows"
                    description="No records match the current builder criteria yet."
                    className="border-0 py-12"
                  />
                ) : (
                  <DataTable
                    caption="Report preview"
                    columns={columns}
                    rows={rows}
                    rowKey={(row) => row.id}
                    empty={null}
                  />
                )}
              </div>
            </Card>

            <Card className="border-dashed p-5">
              <EmptyState
                icon={BarChart3}
                title="Advanced visualizations"
                description="Generate the report to see detailed trend analysis and forecasting models for the selected criteria."
                className="border-0 py-8"
              />
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border-subtle bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <p className="text-xs text-text-muted">
            <span className="mr-1 inline-block size-1.5 rounded-full bg-success" />
            {autoSaving ? 'Auto-saving draft…' : 'Draft saved'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setCancelOpen(true)}>
              Cancel
            </Button>
            <Button loading={isGenerating} onClick={submit}>
              Generate report
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={cancelOpen}
        title="Discard report?"
        confirmLabel="Discard"
        tone="danger"
        onCancel={() => setCancelOpen(false)}
        onConfirm={() => navigate('/reports/library')}
      >
        Unsaved builder changes will be discarded.
      </ConfirmationDialog>
    </>
  )
}
