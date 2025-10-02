import { z } from "zod";
import { propertyBaseSchema, addressSchema } from "@/schemas/property";

export const getPropertyParamsSchema = z.object({ id: z.string() });

export { addressSchema };

export const propertySchema = propertyBaseSchema.extend({
  id: z.string(),
  address: addressSchema.optional(),
  // Adiciona campos específicos de resposta
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  listedBy: z.string().optional(),
});

export type PropertyDTO = z.infer<typeof propertySchema>;
