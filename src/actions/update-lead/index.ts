"use server";

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { updateLeadParamsSchema, updateLeadSchema, type UpdateLeadInput } from "./schema";

export async function updateLead(params: { id: string }, input: UpdateLeadInput): Promise<{ id: string }> {
  const parsedParams = updateLeadParamsSchema.safeParse(params);
  if (!parsedParams.success) throw new Error("Invalid lead ID");

  const parsedInput = updateLeadSchema.safeParse(input);
  if (!parsedInput.success) throw new Error("Invalid lead payload");

  const docRef = adminDb.collection("leads").doc(parsedParams.data.id);
  const doc = await docRef.get();
  
  if (!doc.exists) throw new Error("Lead não encontrado");

  await docRef.update({
    ...parsedInput.data,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { id: parsedParams.data.id };
}
