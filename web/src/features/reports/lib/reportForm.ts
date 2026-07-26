import type {
  DataSource,
  ExportFormat,
  GroupByOption,
  Report,
  ReportCategory,
  ReportPayload,
  ReportType,
  SortByOption,
} from '../types'
import { DATA_SOURCES } from '../types'

export interface ReportBuilderValues {
  name: string
  type: ReportType | ''
  category: ReportCategory | ''
  startDate: string
  endDate: string
  dataSources: DataSource[]
  practiceArea: string
  lawyerId: string
  lawyerName: string
  clientId: string
  clientName: string
  caseId: string
  caseLabel: string
  groupBy: GroupByOption
  sortBy: SortByOption
  sortDir: 'asc' | 'desc'
  formats: ExportFormat[]
}

export type ReportBuilderField = keyof Omit<
  ReportBuilderValues,
  'dataSources' | 'formats' | 'lawyerName' | 'clientName' | 'caseLabel'
>

export type ReportBuilderErrors = Partial<
  Record<ReportBuilderField | 'dataSources' | 'formats', string>
>

export const emptyReportBuilderValues: ReportBuilderValues = {
  name: '',
  type: 'REVENUE',
  category: 'FINANCIAL',
  startDate: '',
  endDate: '',
  dataSources: ['INVOICES'],
  practiceArea: '',
  lawyerId: '',
  lawyerName: '',
  clientId: '',
  clientName: '',
  caseId: '',
  caseLabel: '',
  groupBy: 'NONE',
  sortBy: 'DATE',
  sortDir: 'desc',
  formats: ['PDF', 'CSV'],
}

export function validateReportBuilder(
  values: ReportBuilderValues,
): ReportBuilderErrors {
  const errors: ReportBuilderErrors = {}

  if (!values.name.trim()) errors.name = 'Report name is required.'
  else if (values.name.trim().length < 3) {
    errors.name = 'Use at least 3 characters.'
  }

  if (!values.type) errors.type = 'Select a report type.'
  if (!values.category) errors.category = 'Select a category.'

  if (!values.startDate) errors.startDate = 'Start date is required.'
  if (!values.endDate) errors.endDate = 'End date is required.'

  if (values.startDate && values.endDate) {
    const start = new Date(values.startDate)
    const end = new Date(values.endDate)
    if (Number.isNaN(start.getTime())) errors.startDate = 'Enter a valid date.'
    if (Number.isNaN(end.getTime())) errors.endDate = 'Enter a valid date.'
    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end < start
    ) {
      errors.endDate = 'End date must be on or after the start date.'
    }
  }

  if (values.dataSources.length === 0) {
    errors.dataSources = 'Select at least one data source.'
  }

  if (values.formats.length === 0) {
    errors.formats = 'Select at least one export format.'
  }

  return errors
}

export function toReportPayload(values: ReportBuilderValues): ReportPayload {
  return {
    name: values.name.trim(),
    type: values.type as ReportType,
    category: values.category as ReportCategory,
    formats: values.formats,
    filters: {
      startDate: values.startDate,
      endDate: values.endDate,
      practiceArea: values.practiceArea || undefined,
      lawyerId: values.lawyerId || undefined,
      clientId: values.clientId || undefined,
      caseId: values.caseId || undefined,
      dataSources: values.dataSources,
      groupBy: values.groupBy,
      sortBy: values.sortBy,
      sortDir: values.sortDir,
    },
  }
}

export function toReportBuilderValues(report: Report): ReportBuilderValues {
  return {
    name: report.name,
    type: report.type,
    category: report.category,
    startDate: report.filters.startDate ?? '',
    endDate: report.filters.endDate ?? '',
    dataSources:
      report.filters.dataSources.length > 0
        ? report.filters.dataSources
        : (['INVOICES'] as DataSource[]),
    practiceArea: report.filters.practiceArea ?? '',
    lawyerId: report.filters.lawyerId ?? '',
    lawyerName: '',
    clientId: report.filters.clientId ?? '',
    clientName: '',
    caseId: report.filters.caseId ?? '',
    caseLabel: '',
    groupBy: report.filters.groupBy,
    sortBy: report.filters.sortBy,
    sortDir: report.filters.sortDir,
    formats: report.formats.length > 0 ? report.formats : ['PDF'],
  }
}

export function toggleDataSource(
  current: DataSource[],
  source: DataSource,
): DataSource[] {
  if (current.includes(source)) {
    return current.filter((item) => item !== source)
  }
  return [...current, source]
}

export const allDataSources = [...DATA_SOURCES]
