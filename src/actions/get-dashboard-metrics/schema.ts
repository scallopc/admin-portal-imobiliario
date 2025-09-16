import { z } from 'zod'

export const dashboardMetricsSchema = z.object({
  activeLeads: z.number(),
  opportunities: z.number(),
  proposals: z.number(),
  monthlySales: z.number(),
  aiTokens: z.number(),
  chatInteractions: z.number(),
  topSearches: z.array(z.object({
    term: z.string(),
    count: z.number(),
  })),
})

export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>
