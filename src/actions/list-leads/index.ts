"use server";

import { adminDb } from "@/lib/firebase-admin";
import { listLeadsResponseSchema, type LeadListItem, leadListItemSchema } from "./schema";

// Função para migrar valores antigos para novos
function migrateLeadData(data: any) {
  // Mapeamento de valores antigos para novos
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
    website: "JadeChat",
    social: "Instagram",
    referral: "Indicação",
    other: "Outro",
    site: "JadeChat",
    redes_sociais: "Instagram",
    "redes sociais": "Instagram",
    indicacao: "Indicação",
    indicação: "Indicação",
    outro: "Outro",
    // Adiciona qualquer valor em minúsculas
    ...Object.fromEntries(["JadeChat", "WhatsApp", "Telegram", "Instagram", "Facebook", "Twitter", "LinkedIn", "Indicação", "Outro"].map(v => [v.toLowerCase(), v])),
  };

  // Garante que o stage seja um dos valores válidos
  const validStages = ["Novo", "Contactado", "Qualificado", "Ganho", "Perdido"];
  const stage = stageMapping[data.stage] || data.stage;

  // Garante que o source seja um dos valores válidos
  const validSources = ["JadeChat", "WhatsApp", "Telegram", "Instagram", "Facebook", "Twitter", "LinkedIn", "Indicação", "Outro"];
  const source =
    sourceMapping[data.source?.toLowerCase()] || (validSources.includes(data.source) ? data.source : "Outro");

  return {
    ...data,
    stage: validStages.includes(stage) ? stage : "Novo",
    source: validSources.includes(source) ? source : "Outro",
  };
}

export async function listLeads(): Promise<LeadListItem[]> {
  try {
    const snapshot = await adminDb.collection("leads").get();

    const leads: LeadListItem[] = [];

    snapshot.forEach(doc => {
      try {
        const data = doc.data();

        const migratedData = migrateLeadData(data);

        const leadData = {
          id: doc.id,
          code: migratedData.code || "",
          name: migratedData.name || "",
          email: migratedData.email || "",
          phone: migratedData.phone || "",
          status: migratedData.stage,
          source: migratedData.source,
          notes: migratedData.notes || "",
          createdAt: (migratedData.createdAt?.toDate?.() || migratedData.createdAt?.toDate?.() || new Date()).toISOString(),
          updatedAt: (migratedData.updatedAt?.toDate?.() || migratedData.updatedAt?.toDate?.() || new Date()).toISOString(),
        };

        // Validação individual de cada lead
        const parsedLead = leadListItemSchema.safeParse(leadData);
        if (!parsedLead.success) {
          console.error("Erro de validação do lead:", parsedLead.error);
          console.error("Dados inválidos do lead:", leadData);
          // Pula leads inválidos em vez de falhar completamente
          return;
        }

        leads.push(parsedLead.data);
      } catch (error) {
        console.error(`Erro ao processar o lead ${doc.id}:`, error);
        // Continua para o próximo lead mesmo se um falhar
      }
    });

    // Validação final de todos os leads
    const parsed = listLeadsResponseSchema.safeParse(leads);
    if (!parsed.success) {
      console.error("Erro de validação final dos leads:", parsed.error);
      console.error("Dados inválidos:", leads);
      throw new Error("Dados de leads inválidos. Verifique os logs para mais detalhes.");
    }

    return parsed.data;
  } catch (error) {
    console.error("Erro ao listar leads:", error);
    throw new Error(`Falha ao listar leads: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
  }
}

export async function listRecentLeads(limit: number = 5): Promise<LeadListItem[]> {
  try {
    const snapshot = await adminDb.collection("leads").limit(limit).get();

    const leads: LeadListItem[] = [];

    snapshot.forEach(doc => {
      try {
        const data = doc.data();
        const migratedData = migrateLeadData(data);

        const leadData = {
          id: doc.id,
          code: migratedData.code || "",
          name: migratedData.name || "",
          email: migratedData.email || "",
          phone: migratedData.phone || "",
          status: migratedData.stage,
          source: migratedData.source,
          notes: migratedData.notes || "",
          createdAt: (migratedData.createdAt?.toDate?.() || migratedData.createdAt?.toDate?.() || new Date()).toISOString(),
          updatedAt: (migratedData.updatedAt?.toDate?.() || migratedData.updatedAt?.toDate?.() || new Date()).toISOString(),
        };

        const parsedLead = leadListItemSchema.safeParse(leadData);
        if (parsedLead.success) {
          leads.push(parsedLead.data);
        }
      } catch (error) {
        console.error(`Erro ao processar o lead ${doc.id}:`, error);
      }
    });

    return leads;
  } catch (error) {
    console.error("Erro ao listar leads recentes:", error);
    throw new Error(`Falha ao listar leads recentes: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
  }
}
