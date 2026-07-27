import type { BadgeVariant } from '@/shared/components/Badge'

import type {
  DataSource,
  ExportFormat,
  GroupByOption,
  ReportCategory,
  ReportStatus,
  ReportType,
  ScheduleFrequency,
  SortByOption,
} from '../types'

export const reportCategoryLabels: Record<ReportCategory, string> = {
  FINANCIAL: 'Financial',
  OPERATIONS: 'Operations',
  COMPLIANCE: 'Compliance',
  PRODUCTIVITY: 'Productivity',
  CUSTOM: 'Custom',
}

export const reportCategoryVariants: Record<ReportCategory, BadgeVariant> = {
  FINANCIAL: 'success',
  OPERATIONS: 'info',
  COMPLIANCE: 'warning',
  PRODUCTIVITY: 'accent',
  CUSTOM: 'neutral',
}

export const reportTypeLabels: Record<ReportType, string> = {
  REVENUE: 'Revenue',
  CASES: 'Cases',
  CLIENTS: 'Clients',
  HEARINGS: 'Hearings',
  DOCUMENTS: 'Documents',
  BILLABLE_HOURS: 'Billable hours',
  CUSTOM: 'Custom',
}

export const reportStatusLabels: Record<ReportStatus, string> = {
  DRAFT: 'Draft',
  READY: 'Ready',
  SCHEDULED: 'Scheduled',
  ARCHIVED: 'Archived',
}

export const exportFormatLabels: Record<ExportFormat, string> = {
  PDF: 'PDF',
  CSV: 'CSV',
  XLS: 'XLS',
}

export const dataSourceLabels: Record<DataSource, string> = {
  INVOICES: 'Invoices',
  CASE_HOURS: 'Case hours',
  EXPENSES: 'Expenses',
  CLIENTS: 'Clients',
  CASES: 'Cases',
  HEARINGS: 'Hearings',
  DOCUMENTS: 'Documents',
}

export const groupByLabels: Record<GroupByOption, string> = {
  NONE: 'None',
  PRACTICE_AREA: 'Practice area',
  LAWYER: 'Lawyer',
  CLIENT: 'Client',
  CASE: 'Case',
  MONTH: 'Month',
  STATUS: 'Status',
}

export const sortByLabels: Record<SortByOption, string> = {
  AMOUNT: 'Amount',
  DATE: 'Date',
  NAME: 'Name',
  STATUS: 'Status',
  COUNT: 'Count',
}

export const scheduleFrequencyLabels: Record<ScheduleFrequency, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
}

export const categoryFilterOptions = [
  { value: 'ALL', label: 'All categories' },
  ...Object.entries(reportCategoryLabels).map(([value, label]) => ({
    value,
    label,
  })),
]

export const reportTypeOptions = Object.entries(reportTypeLabels).map(
  ([value, label]) => ({ value, label }),
)

export const groupByOptions = Object.entries(groupByLabels).map(
  ([value, label]) => ({ value, label }),
)

export const sortByOptions = Object.entries(sortByLabels).map(
  ([value, label]) => ({ value, label }),
)

export const exportFormatOptions = Object.entries(exportFormatLabels).map(
  ([value, label]) => ({ value, label }),
)

export const scheduleFrequencyOptions = Object.entries(
  scheduleFrequencyLabels,
).map(([value, label]) => ({ value, label }))
