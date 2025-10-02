import { z } from "zod";


export type Unit = {
  id: string
  unit?: string
  status?: string
  bedrooms?: number
  parkingSpaces?: number
  privateArea?: number
  price?: number
  source?: Record<string, any>
  [key: string]: any
}

export type ReleaseDetails = {
  id: string
  title?: string
  slug?: string
  description?: string
  images?: string[]
  floorPlans?: string[]
  isActive?: boolean
  unitsCount?: number
  createdAt?: number
  units: Unit[]
  [key: string]: any
}


export const updateReleaseSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  code: z.string().optional(),
  title: z.string().min(1, "O título é obrigatório").optional(),
  slug: z.string().min(1, "O slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens").optional(),
  description: z.string().optional(),
  developer: z.string().min(1, "A construtora é obrigatória").optional(),
  type: z
    .enum([
      "Apartamento",
      "Casa",
      "Casa em condomínio",
      "Sobrado",
      "Kitnet",
      "Studio",
      "Penthouse",
      "Cobertura",
      "Comercial",
      "Terreno",
    ])
    .optional(),
  status: z
    .enum([
      "Lançamento",
      "Em construção",
      "Pronto para entrega",
      "Entregue",
      "Pausado",
    ])
    .optional(),
  price: z.number().nonnegative("O preço não pode ser negativo").optional(),
  estimatedPrice: z.string().optional(),
  currency: z.string().optional(),
  totalArea: z.number().nonnegative("A área não pode ser negativa").optional(),
  privateArea: z.number().nonnegative("A área não pode ser negativa").optional(),
  usefulArea: z.number().nonnegative("A área não pode ser negativa").optional(),
  bedrooms: z
    .number()
    .int("O número de quartos deve ser um número inteiro")
    .nonnegative("O número de quartos não pode ser negativo")
    .optional(),
  bathrooms: z
    .number()
    .int("O número de banheiros deve ser um número inteiro")
    .nonnegative("O número de banheiros não pode ser negativo")
    .optional(),
  suites: z
    .number()
    .int("O número de suítes deve ser um número inteiro")
    .nonnegative("O número de suítes não pode ser negativo")
    .optional(),
  parkingSpaces: z
    .number()
    .int("O número de vagas deve ser um número inteiro")
    .nonnegative("O número de vagas não pode ser negativo")
    .optional(),
  furnished: z.boolean().optional(),
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
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().url("URL do vídeo inválida").optional().or(z.literal("")),
  floorPlan: z.string().optional(),
  constructionProgress: z.number().min(0).max(100).optional(),
  launchDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  totalUnits: z.number().int().positive().optional(),
  availableUnits: z.number().int().nonnegative().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  financingOptions: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  seo: z.string().max(160, "SEO deve ter no máximo 160 caracteres").optional(),
  isActive: z.boolean().optional(),
  units: z.array(z.object({
    id: z.string().optional(),
    code: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    price: z.number().nonnegative().optional(),
    estimatedPrice: z.string().optional(),
    currency: z.string().default("BRL"),
    totalArea: z.number().nonnegative().optional(),
    privateArea: z.number().nonnegative().optional(),
    usefulArea: z.number().nonnegative().optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    suites: z.number().int().nonnegative().default(0).optional(),
    parkingSpaces: z.number().int().nonnegative().default(0).optional(),
    furnished: z.boolean().default(false),
    floor: z.string().optional(),
    unit: z.string().optional(),
    block: z.string().optional(),
    tower: z.string().optional(),
    status: z.string().optional(),
    features: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    floorPlan: z.string().optional(),
    isActive: z.boolean().default(true),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })).optional(),
});

export type UpdateReleaseInput = z.infer<typeof updateReleaseSchema>;
