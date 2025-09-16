"use server";

import { adminDb } from "@/lib/firebase-admin";
import { getLeadParamsSchema, leadSchema, type LeadDTO } from "./schema";

// Função para migrar valores antigos para novos
function migrateLeadData(data: any) {
  // Mapeamento de valores antigos para novos
  const stageMapping: Record<string, string> = {
    'new': 'Novo',
    'contacted': 'Contactado',
    'qualified': 'Qualificado',
    'won': 'Ganho',
    'lost': 'Perdido',
    'novo': 'Novo',
    'contactado': 'Contactado',
    'qualificado': 'Qualificado',
    'ganho': 'Ganho',
    'perdido': 'Perdido'
  }

  const sourceMapping: Record<string, string> = {
    'website': 'Site',
    'social': 'Redes Sociais',
    'referral': 'Indicação',
    'other': 'Outro',
    'site': 'Site',
    'redes_sociais': 'Redes Sociais',
    'indicacao': 'Indicação',
    'outro': 'Outro'
  }

  return {
    ...data,
    stage: stageMapping[data.stage] || data.stage || 'Novo',
    source: sourceMapping[data.source] || data.source || 'Site'
  }
}

export async function getLead(params: { id: string }): Promise<LeadDTO> {
  const parsed = getLeadParamsSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid lead ID");

  const doc = await adminDb.collection("leads").doc(parsed.data.id).get();
  if (!doc.exists) throw new Error("Lead não encontrado");

  const data = doc.data()!;
  const migratedData = migrateLeadData(data);
  
  const lead: LeadDTO = {
    id: doc.id,
    code: migratedData.code || "",
    name: migratedData.name || "",
    email: migratedData.email || "",
    phone: migratedData.phone || "",
    stage: migratedData.stage,
    source: migratedData.source,
    notes: migratedData.notes || "",
    createdAt: migratedData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: migratedData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };

  const validated = leadSchema.safeParse(lead);
  if (!validated.success) {
    console.error('Erro de validação do lead:', validated.error)
    throw new Error("Invalid lead data");
  }
  return validated.data;
}
