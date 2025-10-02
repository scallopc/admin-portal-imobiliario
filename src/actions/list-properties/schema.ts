import { z } from "zod";

export const propertyListItemSchema = z.object({
  id: z.string(),
  code: z.string().default(""),
  title: z.string().default(""),
  type: z.enum(["Casa", "Casa em condomínio", "Apartamento", "Terreno", "Comercial", "Penthouse", "Cobertura", "Sobrado", "Kitnet", "Studio"]).default("Casa"),
  status: z.enum(["Venda", "Aluguel"]).optional(),
  bedrooms: z.number().optional().default(0),
  bathrooms: z.number().optional().default(0),
  suites: z.number().optional().default(0),
  updatedAt: z.string().default(""),
});

export const listPropertiesResponseSchema = z.array(propertyListItemSchema);

export type PropertyListItem = z.infer<typeof propertyListItemSchema>;
