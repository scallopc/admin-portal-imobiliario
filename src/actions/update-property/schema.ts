import { z } from "zod";
import { propertySchema } from "@/schemas/property";

export const updatePropertySchema = propertySchema.partial().extend({
  images: z.array(z.string().url()).optional(),
  floorPlans: z.array(z.string().url()).optional(),
  urlsToDelete: z.array(z.string().url()).optional(), // Novo campo
});

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
