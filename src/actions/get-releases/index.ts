"use server";

import { adminDb } from "@/lib/firebase-admin";
import { type Release } from "@/schemas/release";

export async function getReleases(): Promise<Release[]> {
  try {
    const snapshot = await adminDb.collection("releases").get();

    const releases: Release[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const releaseData = {
        id: doc.id,
        ...data,
        units: data.units || [], // Garantir que units existe
      };

      // Adicionar release sem validação Zod
      releases.push(releaseData as Release);
    }

    return releases;
  } catch (error) {
    console.error("Erro ao buscar lançamentos:", error);
    return [];
  }
}

export async function getReleaseById(id: string): Promise<Release | null> {
  try {
    const doc = await adminDb.collection("releases").doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();

    const releaseData = {
      id: doc.id,
      ...data,
      units: data?.units || [], // Garantir que units existe
    };

    // Retornar dados sem validação Zod
    return releaseData as Release;
  } catch (error) {
    console.error("Erro ao buscar lançamento:", error);
    return null;
  }
}
