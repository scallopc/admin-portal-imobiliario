import { z } from 'zod'

export const importInvexoPropertiesSchema = z.object({
  state: z.enum(['rj', 'sc']).default('rj'),
  limit: z.number().min(1).max(100).default(20),
  site: z.enum(['luxury', 'lancamentos', 'both']).default('both')
})

export type ImportInvexoPropertiesInput = z.infer<typeof importInvexoPropertiesSchema>
