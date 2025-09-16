import { z } from "zod"

export const createLeadSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  stage: z.enum(["Novo", "Contactado", "Qualificado", "Ganho", "Perdido"]).default("Novo"),
  source: z.enum(["Site", "Redes Sociais", "Indicação", "Outro"]).default("Site"),
  notes: z.string().optional().or(z.literal("")),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})


export type CreateLeadInput = z.infer<typeof createLeadSchema>;



