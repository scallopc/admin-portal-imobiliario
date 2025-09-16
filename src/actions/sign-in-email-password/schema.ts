import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type SignInInput = z.infer<typeof signInSchema>;

export type SignInResult = {
  uid: string;
  email: string | null;
  idToken: string;
};
