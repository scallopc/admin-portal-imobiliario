import { z } from "zod";
import { propertyBaseSchema, coordinatesSchema, addressSchema } from "@/schemas/property";

export const getPropertyParamsSchema = z.object({ id: z.string() });

export { coordinatesSchema, addressSchema };

export const propertySchema = z.object({
  id: z.string(),
  ...propertyBaseSchema,
  address: addressSchema.optional(),
  coordinates: coordinatesSchema.optional(),
  // Adiciona campos específicos de resposta
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  listedBy: z.string().optional(),
});

export type PropertyDTO = z.infer<typeof propertySchema>;
