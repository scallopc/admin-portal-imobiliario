"use server";

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { updateLinkParamsSchema, updateLinkSchema, type UpdateLinkInput } from "./schema";

export async function updateLink(id: string, input: UpdateLinkInput): Promise<void> {
  const params = updateLinkParamsSchema.safeParse({ id })
  if (!params.success) throw new Error("Invalid link ID")

  const parsed = updateLinkSchema.safeParse(input)
  if (!parsed.success) throw new Error("Dados inválidos para atualização de link")

  await adminDb.collection("links").doc(id).set({
    ...parsed.data,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })
}


