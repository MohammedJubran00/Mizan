import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/stores/toastStore'

import {
  reportsService,
  type DashboardQuery,
  type ReportListParams,
} from '../api/reportsService'
import type {
  AnalyticsQuery,
  ExportFormat,
  Report,
  ReportPayload,
  ScheduleReportPayload,
} from '../types'

export const reportsKeys = {
  all: ['reports'] as const,
  dashboard: (query: DashboardQuery) =>
    ['reports', 'dashboard', query] as const,
  list: (params: ReportListParams) => ['reports', 'list', params] as const,
  librarySummary: () => ['reports', 'library-summary'] as const,
  detail: (id: string) => ['reports', 'detail', id] as const,
  preview: (payload: ReportPayload) =>
    ['reports', 'preview', payload] as const,
  analytics: (query: AnalyticsQuery) =>
    ['reports', 'analytics', query] as const,
}

export type ReportsResourceState = 'loading' | 'error' | 'empty' | 'ready'

function describeError(error: unknown) {
  return error instanceof Error ? error.message : 'Please try again.'
}

async function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function useReportsDashboard(query: DashboardQuery = {}) {
  const result = useQuery({
    queryKey: reportsKeys.dashboard(query),
    queryFn: () => reportsService.getDashboard(query),
  })

  const dashboard = result.data ?? null
  const hasData =
    dashboard !== null &&
    (Boolean(dashboard.kpis) ||
      dashboard.monthlyRevenue.length > 0 ||
      dashboard.practiceAreaRevenue.length > 0)

  const state: ReportsResourceState = result.isPending
    ? 'loading'
    : result.isError
      ? 'error'
      : !hasData
        ? 'empty'
        : 'ready'

  return {
    dashboard,
    state,
    isLoading: result.isPending,
    refetch: result.refetch,
    error: result.error,
  }
}

export function useReportList(params: ReportListParams) {
  const query = useQuery({
    queryKey: reportsKeys.list(params),
    queryFn: () => reportsService.getReports(params),
  })

  const items = query.data?.items ?? []

  const state: ReportsResourceState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : items.length === 0
        ? 'empty'
        : 'ready'

  return {
    items,
    pagination: query.data?.pagination,
    state,
    isSearching: query.isFetching && !query.isPending,
    refetch: query.refetch,
  }
}

export function useLibrarySummary() {
  const query = useQuery({
    queryKey: reportsKeys.librarySummary(),
    queryFn: () => reportsService.getLibrarySummary(),
  })

  return {
    summary: query.data ?? null,
    isLoading: query.isPending,
  }
}

export function useReportDetails(id: string | undefined) {
  const query = useQuery({
    queryKey: reportsKeys.detail(id ?? 'unknown'),
    queryFn: () => reportsService.getReport(id as string),
    enabled: Boolean(id),
  })

  const report: Report | null = query.data ?? null

  const state: ReportsResourceState = !id
    ? 'empty'
    : query.isPending
      ? 'loading'
      : query.isError
        ? 'error'
        : report === null
          ? 'empty'
          : 'ready'

  return {
    report,
    state,
    refetch: query.refetch,
  }
}

export function useReportPreview(payload: ReportPayload | null, enabled: boolean) {
  const query = useQuery({
    queryKey: reportsKeys.preview(
      payload ?? {
        name: '',
        type: 'CUSTOM',
        category: 'CUSTOM',
        formats: [],
        filters: {
          dataSources: [],
          groupBy: 'NONE',
          sortBy: 'DATE',
          sortDir: 'desc',
        },
      },
    ),
    queryFn: () => reportsService.previewReport(payload as ReportPayload),
    enabled: enabled && payload !== null,
  })

  const rows = query.data ?? []

  const state: ReportsResourceState = !enabled
    ? 'empty'
    : query.isPending
      ? 'loading'
      : query.isError
        ? 'error'
        : rows.length === 0
          ? 'empty'
          : 'ready'

  return {
    rows,
    state,
    isFetching: query.isFetching,
  }
}

export function usePracticeInsights(query: AnalyticsQuery = {}) {
  const result = useQuery({
    queryKey: reportsKeys.analytics(query),
    queryFn: () => reportsService.getAnalytics(query),
  })

  const insights = result.data ?? null
  const hasData =
    insights !== null &&
    (insights.billableHoursTrend.length > 0 ||
      insights.totalRevenue != null ||
      insights.activeCases != null)

  const state: ReportsResourceState = result.isPending
    ? 'loading'
    : result.isError
      ? 'error'
      : !hasData
        ? 'empty'
        : 'ready'

  return {
    insights,
    state,
    isLoading: result.isPending,
    refetch: result.refetch,
  }
}

interface MutationCallbacks {
  onGenerated?: (report: Report | null) => void
  onUpdated?: (report: Report | null) => void
  onDeleted?: () => void
  onDuplicated?: (report: Report | null) => void
  onScheduled?: () => void
  onRenamed?: (report: Report | null) => void
}

export function useReportsMutations({
  onGenerated,
  onUpdated,
  onDeleted,
  onDuplicated,
  onScheduled,
  onRenamed,
}: MutationCallbacks = {}) {
  const queryClient = useQueryClient()

  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: reportsKeys.all })

  const generateReport = useMutation({
    mutationFn: (payload: ReportPayload) =>
      reportsService.generateReport(payload),
    onSuccess: async (report) => {
      await invalidateAll()
      toast.success('Report generated', 'The report has been saved to your library.')
      onGenerated?.(report)
    },
    onError: (error) =>
      toast.error('Could not generate report', describeError(error)),
  })

  const updateReport = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<ReportPayload>
    }) => reportsService.updateReport(id, payload),
    onSuccess: async (report, variables) => {
      await queryClient.invalidateQueries({
        queryKey: reportsKeys.detail(variables.id),
      })
      await invalidateAll()
      toast.success('Report updated', 'Your changes have been saved.')
      onUpdated?.(report)
    },
    onError: (error) =>
      toast.error('Could not update report', describeError(error)),
  })

  const deleteReport = useMutation({
    mutationFn: (id: string) => reportsService.deleteReport(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: reportsKeys.detail(id) })
      await invalidateAll()
      toast.success('Report deleted', 'The report was permanently removed.')
      onDeleted?.()
    },
    onError: (error) =>
      toast.error('Could not delete report', describeError(error)),
  })

  const duplicateReport = useMutation({
    mutationFn: (id: string) => reportsService.duplicateReport(id),
    onSuccess: async (report) => {
      await invalidateAll()
      toast.success('Report duplicated', 'A copy has been added to your library.')
      onDuplicated?.(report)
    },
    onError: (error) =>
      toast.error('Could not duplicate report', describeError(error)),
  })

  const renameReport = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      reportsService.renameReport(id, name),
    onSuccess: async (report, variables) => {
      await queryClient.invalidateQueries({
        queryKey: reportsKeys.detail(variables.id),
      })
      await invalidateAll()
      toast.success('Report renamed', 'The new name has been saved.')
      onRenamed?.(report)
    },
    onError: (error) =>
      toast.error('Could not rename report', describeError(error)),
  })

  const runReport = useMutation({
    mutationFn: (id: string) => reportsService.runReport(id),
    onSuccess: async (report, id) => {
      await queryClient.invalidateQueries({ queryKey: reportsKeys.detail(id) })
      await invalidateAll()
      toast.success('Report run complete', 'Latest results are ready to view.')
      onUpdated?.(report)
    },
    onError: (error) =>
      toast.error('Could not run report', describeError(error)),
  })

  const scheduleReport = useMutation({
    mutationFn: ({
      reportId,
      payload,
    }: {
      reportId: string
      payload: ScheduleReportPayload
    }) => reportsService.scheduleReport(reportId, payload),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Schedule saved', 'The report will be delivered on schedule.')
      onScheduled?.()
    },
    onError: (error) =>
      toast.error('Could not save schedule', describeError(error)),
  })

  const exportReport = useMutation({
    mutationFn: async ({
      id,
      format,
    }: {
      id: string
      format: ExportFormat
    }) => {
      const blob =
        format === 'PDF'
          ? await reportsService.exportPdf(id)
          : format === 'XLS'
            ? await reportsService.exportExcel(id)
            : await reportsService.exportCsv(id)

      if (!blob) {
        throw new Error(
          `${format} export is not available until the reports API is connected.`,
        )
      }
      return { blob, format, id }
    },
    onSuccess: ({ blob, format, id }) => {
      const extension = format === 'XLS' ? 'xlsx' : format.toLowerCase()
      downloadBlob(blob, `report-${id}.${extension}`)
      toast.success('Export started', `Your ${format} file is downloading.`)
    },
    onError: (error) =>
      toast.error('Could not export report', describeError(error)),
  })

  const shareReport = useMutation({
    mutationFn: ({
      id,
      recipients,
    }: {
      id: string
      recipients: string[]
    }) => reportsService.shareReport(id, recipients),
    onSuccess: () => {
      toast.success('Share queued', 'Recipients will receive the report link.')
    },
    onError: (error) =>
      toast.error('Could not share report', describeError(error)),
  })

  return {
    generateReport,
    updateReport,
    deleteReport,
    duplicateReport,
    renameReport,
    runReport,
    scheduleReport,
    exportReport,
    shareReport,
    isGenerating: generateReport.isPending || updateReport.isPending,
    isDeleting: deleteReport.isPending,
    isExporting: exportReport.isPending,
    isScheduling: scheduleReport.isPending,
  }
}
