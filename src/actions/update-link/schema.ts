import { z } from "zod"

export const updateLinkParamsSchema = z.object({
  id: z.string(),
})

export const updateLinkSchema = z.object({
  type: z.enum(["Linktree", "Google Drive", "Site", "Outro"]).optional(),
  title: z.string().min(1, "O título é obrigatório").optional(),
  url: z.string().url("URL inválida").optional(),
})

export type UpdateLinkInput = z.infer<typeof updateLinkSchema>


