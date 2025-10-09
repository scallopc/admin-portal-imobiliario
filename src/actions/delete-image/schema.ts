import { z } from "zod";

export const deleteImageSchema = z.object({
  url: z.string().url(),
});

export type DeleteImageInput = z.infer<typeof deleteImageSchema>;
