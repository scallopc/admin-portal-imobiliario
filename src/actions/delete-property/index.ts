"use server"

import { adminDb } from "@/lib/firebase-admin";
import { CloudinaryService } from "@/services/cloudinary.service";

export async function deleteProperty(id: string): Promise<void> {
  try {
    await Promise.all([
      adminDb.collection("properties").doc(id).delete(),
      CloudinaryService.deleteFolder(id),
    ]);
  } catch (error) {
    console.error("Error deleting property:", error)
    throw new Error("Falha ao excluir o imóvel")
  }
}
