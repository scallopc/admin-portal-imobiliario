"use server"

import { adminDb } from "@/lib/firebase-admin"

export async function deleteProperty(id: string): Promise<void> {
  try {
    await adminDb.collection("properties").doc(id).delete()
  } catch (error) {
    console.error("Error deleting property:", error)
    throw new Error("Falha ao excluir o imóvel")
  }
}
