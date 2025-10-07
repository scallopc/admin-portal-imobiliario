import { z } from "zod"
import { statusLead, sourceLead } from "@/lib/constants"

export const leadListItemSchema = z.object({
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

export const listLeadsResponseSchema = z.array(leadListItemSchema)

export type LeadListItem = z.infer<typeof leadListItemSchema>
