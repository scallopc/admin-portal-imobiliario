"use server";

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { createLeadSchema, type CreateLeadInput } from "./schema";

export async function createLead(input: CreateLeadInput): Promise<{ id: string }> {
  const parsed = createLeadSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid lead payload");
  const data = parsed.data;
  const now = FieldValue.serverTimestamp();

  async function generateUniqueCode(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const n = Math.floor(Math.random() * 100000);
      const code = `L-${n.toString().padStart(5, "0")}`;
      const snap = await adminDb.collection("leads").where("code", "==", code).limit(1).get();
      if (snap.empty) return code;
    }
    throw new Error("Failed to generate unique lead code");
  }

  const code = await generateUniqueCode();
  const docRef = await adminDb.collection("leads").add({
    ...data,
    code,
    createdAt: now,
    updatedAt: now,
  });
  return { id: docRef.id };
}
