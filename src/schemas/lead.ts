import { z } from "zod"
import { statusLead, sourceLead } from "@/lib/constants"

export const createLeadSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  status: z.enum(statusLead).default("Novo"),
  source: z.enum(sourceLead).default("JadeChat"),
  notes: z.string().optional().or(z.literal("")),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})


export type CreateLeadInput = z.infer<typeof createLeadSchema>;



