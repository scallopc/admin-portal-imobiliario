"use server";

import { adminDb } from "@/lib/firebase-admin";
import { type Release } from "@/schemas/release";

export async function getReleases(): Promise<Release[]> {
  try {
    // Ordenar por createdAt desc para mostrar os mais recentes primeiro
    const snapshot = await adminDb
      .collection("releases")
      .orderBy("createdAt", "desc")
      .get();

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

    console.log(`Buscados ${releases.length} lançamentos do Firebase`);
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
