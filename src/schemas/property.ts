import { z } from "zod";

export const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
}).optional();

export const addressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional().refine((val) => !val || val.length === 9, "CEP deve ter 9 caracteres").refine((val) => !val || /^\d{5}-\d{3}$/.test(val), "Formato de CEP inválido"),
  country: z.string().default("Brasil"),
});

export const propertyBaseSchema = {
  code: z.string().optional(),
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["Casa", "Apartamento", "Terreno", "Comercial", "Penthouse", "Cobertura", "Sobrado", "Kitnet", "Studio"]).optional(),
  status: z.enum(["Venda", "Aluguel", "available", "sold", "rented"]).optional(),
  price: z.number().nonnegative("O preço não pode ser negativo").optional(),
  currency: z.string().default("BRL"),
  area: z.number().nonnegative("A área não pode ser negativa").optional(),
  bedrooms: z.number().int("O número de quartos deve ser um número inteiro")
    .nonnegative("O número de quartos não pode ser negativo").optional(),
  bathrooms: z.number().int("O número de banheiros deve ser um número inteiro")
    .nonnegative("O número de banheiros não pode ser negativo").optional(),
  suites: z.number().int("O número de suítes deve ser um número inteiro")
    .nonnegative("O número de suítes não pode ser negativo")
    .default(0).optional(),
  parkingSpaces: z.number().int("O número de vagas deve ser um número inteiro")
    .nonnegative("O número de vagas não pode ser negativo")
    .default(0).optional(),
  furnished: z.boolean().default(false),
  address: addressSchema.optional(),
  coordinates: coordinatesSchema.optional(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  listedBy: z.string().optional(),
};

export const createPropertySchema = z.object({
  ...propertyBaseSchema,
  // Campos específicos da criação podem ser adicionados aqui
});

export const updatePropertySchema = z.object({
  ...propertyBaseSchema,
  // Todos os campos são opcionais na atualização
}).partial();

export const propertySchema = z.object(propertyBaseSchema);

// Tipos
export type PropertyInput = z.infer<typeof propertySchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CoordinatesInput = z.infer<typeof coordinatesSchema>;
