import { z } from "zod";
import { propertyBaseSchema } from "@/schemas/property";

export const updatePropertyParamsSchema = z.object({ id: z.string() });

export const updatePropertySchema = z.object({
  ...Object.entries(propertyBaseSchema).reduce((acc, [key, schema]) => {
    // Aplica .optional() em todos os campos do schema base
    acc[key] = schema.optional();
    return acc;
  }, {} as Record<string, any>),
  // Sobrescreve o schema de endereço para ser opcional também
  address: propertyBaseSchema.address.optional(),
  coordinates: propertyBaseSchema.coordinates.optional(),
}).partial();

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
