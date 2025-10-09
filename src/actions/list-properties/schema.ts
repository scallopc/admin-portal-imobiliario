import { z } from "zod";
import { propertyTypes, statusProperty } from "@/lib/constants";

export const propertyListItemSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  propertyType: z.enum(propertyTypes),
  status: z.enum(statusProperty).optional(),
  highlight: z.boolean().optional().default(false),
  updatedAt: z.string().default(""),
});

export const listPropertiesResponseSchema = z.array(propertyListItemSchema);

export type PropertyListItem = z.infer<typeof propertyListItemSchema>;
