"use server";

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Função para migrar valores antigos para novos
function migrateLeadData(data: any) {
  const stageMapping: Record<string, string> = {
    new: "Novo",
    contacted: "Contactado",
    qualified: "Qualificado",
    won: "Ganho",
    lost: "Perdido",
    novo: "Novo",
    contactado: "Contactado",
    qualificado: "Qualificado",
    ganho: "Ganho",
    perdido: "Perdido",
  };

  const sourceMapping: Record<string, string> = {
    website: "Site",
    social: "Redes Sociais",
    referral: "Indicação",
    other: "Outro",
    site: "Site",
    redes_sociais: "Redes Sociais",
    indicacao: "Indicação",
    outro: "Outro",
  };

  return {
    ...data,
    stage: stageMapping[data.stage] || data.stage || "Novo",
    source: sourceMapping[data.source] || data.source || "Site",
  };
}

function migratePropertyData(data: any) {
  const typeMapping: Record<string, string> = {
    house: "Casa",
    apartment: "Apartamento",
    land: "Terreno",
    commercial: "Comercial",
    casa: "Casa",
    apartamento: "Apartamento",
    terreno: "Terreno",
    comercial: "Comercial",
  };

  const statusMapping: Record<string, string> = {
    for_sale: "Venda",
    for_rent: "Aluguel",
    venda: "Venda",
    aluguel: "Aluguel",
  };

  return {
    ...data,
    type: typeMapping[data.type] || data.type || "Casa",
    status: statusMapping[data.status] || data.status || "Venda",
  };
}

export async function migrateData() {
  try {
    // Migrar leads
    const leadsSnapshot = await adminDb.collection("leads").get();
    let leadsMigrated = 0;

    for (const doc of leadsSnapshot.docs) {
      const data = doc.data();
      const migratedData = migrateLeadData(data);

      // Verificar se precisa migrar
      if (data.stage !== migratedData.stage || data.source !== migratedData.source) {
        await doc.ref.update({
          ...migratedData,
          updatedAt: FieldValue.serverTimestamp(),
        });
        leadsMigrated++;
      }
    }

    // Migrar propriedades
    const propertiesSnapshot = await adminDb.collection("properties").get();
    let propertiesMigrated = 0;

    for (const doc of propertiesSnapshot.docs) {
      const data = doc.data();
      const migratedData = migratePropertyData(data);

      // Verificar se precisa migrar
      if (data.type !== migratedData.type || data.status !== migratedData.status) {
        await doc.ref.update({
          ...migratedData,
          updatedAt: FieldValue.serverTimestamp(),
        });
        propertiesMigrated++;
      }
    }

    return {
      success: true,
      leadsMigrated,
      propertiesMigrated,
    };
  } catch (error) {
    console.error("Erro durante a migração:", error);
    throw new Error("Falha na migração dos dados");
  }
}
