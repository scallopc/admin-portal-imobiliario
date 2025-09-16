import { useQuery, queryOptions } from '@tanstack/react-query'
import type { DashboardMetrics } from '@/actions/get-dashboard-metrics/schema'

export const dashboardMetricsQueryKey = () => ['dashboard', 'metrics'] as const

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch('/api/dashboard/metrics', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics')
  return res.json()
}

export function useDashboardMetrics() {
  return useQuery(
    queryOptions({
      queryKey: dashboardMetricsQueryKey(),
      queryFn: fetchDashboardMetrics,
      staleTime: 30_000,
    })
  )
}
