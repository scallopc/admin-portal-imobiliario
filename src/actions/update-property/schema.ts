import { z } from "zod";
import { propertyBaseSchema } from "@/schemas/property";

export const updatePropertyParamsSchema = z.object({ id: z.string() });

export const updatePropertySchema = propertyBaseSchema.extend({
  address: propertyBaseSchema.shape.address.optional(),
}).partial();

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
