import { z } from "zod";

export const linkListItemSchema = z.object({
  id: z.string(),
  type: z.enum(["Linktree", "Google Drive", "Site", "Outro"]),
  title: z.string(),
  url: z.string().url(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type LinkListItem = z.infer<typeof linkListItemSchema>

export const listLinksResponseSchema = z.array(linkListItemSchema)


