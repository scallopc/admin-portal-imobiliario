import { z } from "zod"
import { statusLead, sourceLead } from "@/lib/constants"

export const getLeadParamsSchema = z.object({
  id: z.string()
})

export const leadSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(statusLead),
  source: z.enum(sourceLead),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type LeadDTO = z.infer<typeof leadSchema>
