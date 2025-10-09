import { z } from "zod"
import { statusLead, sourceLead } from "@/lib/constants"

export const updateLeadParamsSchema = z.object({
  id: z.string()
})

export const updateLeadSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório").optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  status: z.enum(statusLead).optional(),
  source: z.enum(sourceLead).optional(),
  notes: z.string().optional().or(z.literal("")),
})

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
