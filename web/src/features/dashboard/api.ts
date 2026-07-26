import { apiClient, getErrorMessage } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { DashboardResponse } from '@/features/dashboard/types'

export interface DashboardQuery {
  activityPage?: number
  activityPageSize?: number
  activityCursor?: string | null
}

export async function fetchDashboard(query: DashboardQuery = {}) {
  try {
    const { data } = await apiClient.get<DashboardResponse>(endpoints.dashboard, {
      params: {
        activityPage: query.activityPage,
        activityPageSize: query.activityPageSize ?? 20,
        activityCursor: query.activityCursor ?? undefined,
      },
    })
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to load dashboard.'))
  }
}
