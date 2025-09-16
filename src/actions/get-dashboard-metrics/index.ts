'use server'

import { dashboardMetricsSchema, type DashboardMetrics } from './schema'

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const data = {
    activeLeads: 128,
    opportunities: 54,
    proposals: 23,
    monthlySales: 7,
    aiTokens: 15420,
    chatInteractions: 342,
    topSearches: [
      { term: "apartamento com vista para o mar", count: 89 },
      { term: "casa com piscina", count: 67 },
      { term: "apartamento 2 quartos", count: 54 },
      { term: "próximo ao metrô", count: 43 },
      { term: "cobertura com varanda", count: 38 },
    ],
  }
  const parsed = dashboardMetricsSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid dashboard metrics')
  return parsed.data
}
