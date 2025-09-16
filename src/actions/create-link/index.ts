"use server";

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { createLinkSchema, type CreateLinkInput, createLinkResponseSchema, type CreateLinkResponse } from "./schema";

export async function createLink(input: CreateLinkInput): Promise<CreateLinkResponse> {
  const parsed = createLinkSchema.safeParse(input)
  if (!parsed.success) throw new Error("Dados inválidos para criação de link")

  const payload = {
    ...parsed.data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }

  const docRef = await adminDb.collection("links").add(payload)
  return { id: docRef.id }
}


