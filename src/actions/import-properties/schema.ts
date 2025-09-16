import { z } from 'zod'

export const importPropertiesSchema = z.object({
  properties: z.array(z.object({
    code: z.string().optional(),
    title: z.string().min(1, "O título é obrigatório"),
    description: z.string().optional(),
    type: z.enum(["Casa", "Apartamento", "Terreno", "Comercial", "Penthouse", "Cobertura", "Sobrado", "Kitnet", "Studio"]).optional(),
    status: z.enum(["Venda", "Aluguel", "available", "sold", "rented"]).optional(),
    price: z.number().nonnegative("O preço não pode ser negativo").optional(),
    currency: z.string().default("BRL"),
    area: z.number().nonnegative("A área não pode ser negativa").optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    suites: z.number().int().nonnegative().optional(),
    parkingSpaces: z.number().int().nonnegative().optional(),
    furnished: z.boolean().default(false),
    address: z.object({
      street: z.string().optional(),
      number: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().default("Brasil"),
    }).optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    features: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    videos: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
  }))
})

export type ImportPropertiesInput = z.infer<typeof importPropertiesSchema>
