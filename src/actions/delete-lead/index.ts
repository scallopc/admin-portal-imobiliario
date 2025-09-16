"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function deleteLead(params: { id: string }): Promise<{ success: true }> {
  if (!params.id) throw new Error("Lead ID is required");

  const docRef = adminDb.collection("leads").doc(params.id);
  const doc = await docRef.get();
  
  if (!doc.exists) throw new Error("Lead não encontrado");

  await docRef.delete();
  return { success: true };
}
