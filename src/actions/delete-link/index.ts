"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function deleteLink(id: string): Promise<void> {
  if (!id) throw new Error("ID inválido")
  await adminDb.collection("links").doc(id).delete()
}


