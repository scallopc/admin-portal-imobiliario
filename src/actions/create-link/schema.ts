import { z } from "zod"

export const createLinkSchema = z.object({
  type: z.enum(["Linktree", "Google Drive", "Site", "Outro"]),
  title: z.string().min(1, "O título é obrigatório"),
  url: z.string().url("URL inválida"),
})

export type CreateLinkInput = z.infer<typeof createLinkSchema>

export const createLinkResponseSchema = z.object({
  id: z.string(),
})

export type CreateLinkResponse = z.infer<typeof createLinkResponseSchema>


