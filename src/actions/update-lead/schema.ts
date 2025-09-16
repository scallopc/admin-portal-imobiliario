import { z } from "zod"

export const updateLeadParamsSchema = z.object({
  id: z.string()
})

export const updateLeadSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório").optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  stage: z.enum(["Novo", "Contactado", "Qualificado", "Ganho", "Perdido"]).optional(),
  source: z.enum(["Site", "Redes Sociais", "Indicação", "Outro"]).optional(),
  notes: z.string().optional().or(z.literal("")),
})

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
