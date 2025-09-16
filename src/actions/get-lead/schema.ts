import { z } from "zod"

export const getLeadParamsSchema = z.object({
  id: z.string()
})

export const leadSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  stage: z.enum(["Novo", "Contactado", "Qualificado", "Ganho", "Perdido"]),
  source: z.enum(["Site", "Redes Sociais", "Indicação", "Outro"]),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type LeadDTO = z.infer<typeof leadSchema>
