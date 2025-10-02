import { z } from "zod";

export const addressSchema = z.object({
  city: z.string().min(1, "Cidade é obrigatória"),
  street: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  number: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

export const propertyBaseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  propertyType: z.string().min(1, "Tipo de imóvel é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  price: z.string().min(1, "Preço é obrigatório"),
  totalArea: z.number().optional(),
  privateArea: z.number().min(0, "Área privativa é obrigatória"),
  usefulArea: z.number().min(0, "Área útil é obrigatória"),
  bedrooms: z.number().min(0, "Número de dormitórios é obrigatório"),
  bathrooms: z.number().min(0, "Número de banheiros é obrigatório"),
  suites: z.number().min(0, "Número de suítes é obrigatório"),
  suiteDetails: z.string().optional(),
  parkingSpaces: z.number().optional(),
  features: z.array(z.string()).min(1, "Mínimo de 1 característica é obrigatória"),
  images: z.array(z.union([z.string().url(), z.instanceof(File)])).optional(),
  floorPlans: z.array(z.union([z.string().url(), z.instanceof(File)])).optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  virtualTourUrl: z.string().url().optional().or(z.literal("")),
  seo: z.string().optional(),
  furnished: z.boolean().optional(),
  address: addressSchema,
});

export const propertySchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  propertyType: z.string().min(1, "Tipo de imóvel é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  price: z.string().min(1, "Preço é obrigatório"),
  totalArea: z.number().min(0, "Área total é obrigatória"),
  privateArea: z.number().optional(),
  usefulArea: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  suites: z.number().optional(),
  suiteDetails: z.string().optional(),
  parkingSpaces: z.number().optional(),
  features: z.array(z.string()).min(1, "Mínimo de 1 característica é obrigatória"),
  images: z.array(z.union([z.string().url(), z.instanceof(File)])).optional(),
  floorPlans: z.array(z.union([z.string().url(), z.instanceof(File)])).optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  virtualTourUrl: z.string().url().optional().or(z.literal("")),
  seo: z.string().optional(),
  furnished: z.boolean().optional(),
  address: addressSchema,
});

export const createPropertySchema = propertyBaseSchema.extend({
  address: addressSchema,
});

export const propertyOnCreateSchema = propertyBaseSchema.omit({ images: true, floorPlans: true });

export type Address = z.infer<typeof addressSchema>;
export type Property = z.infer<typeof propertySchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type PropertyOnCreateInput = z.infer<typeof propertyOnCreateSchema>;
