'use server'

import { adminDb } from "@/lib/firebase-admin"
import { listLeadsResponseSchema, type LeadListItem, leadListItemSchema } from './schema'

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
    'redes sociais': 'Redes Sociais',
    'indicacao': 'Indicação',
    'indicação': 'Indicação',
    'outro': 'Outro',
    // Adiciona qualquer valor em minúsculas
    ...Object.fromEntries(
      ['Site', 'Redes Sociais', 'Indicação', 'Outro']
        .map(v => [v.toLowerCase(), v])
    )
  }

  // Garante que o stage seja um dos valores válidos
  const validStages = ['Novo', 'Contactado', 'Qualificado', 'Ganho', 'Perdido'];
  const stage = stageMapping[data.stage] || data.stage;
  
  // Garante que o source seja um dos valores válidos
  const validSources = ['Site', 'Redes Sociais', 'Indicação', 'Outro'];
  const source = sourceMapping[data.source?.toLowerCase()] || 
                (validSources.includes(data.source) ? data.source : 'Outro');

  return {
    ...data,
    stage: validStages.includes(stage) ? stage : 'Novo',
    source: validSources.includes(source) ? source : 'Outro'
  }
}

export async function listLeads(): Promise<LeadListItem[]> {
  try {
    const snapshot = await adminDb.collection("leads").orderBy("createdAt", "desc").get()
    
    const leads: LeadListItem[] = []
    
    snapshot.forEach((doc) => {
      try {
        const data = doc.data()
        console.log('Dados brutos do lead:', JSON.stringify(data, null, 2))
        
        const migratedData = migrateLeadData(data)
        console.log('Dados após migração:', JSON.stringify(migratedData, null, 2))
        
        const leadData = {
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
        }
        
        console.log('Dados do lead antes da validação:', JSON.stringify(leadData, null, 2))
        
        // Validação individual de cada lead
        const parsedLead = leadListItemSchema.safeParse(leadData)
        if (!parsedLead.success) {
          console.error('Erro de validação do lead:', parsedLead.error)
          console.error('Dados inválidos do lead:', leadData)
          // Pula leads inválidos em vez de falhar completamente
          return
        }
        
        leads.push(parsedLead.data)
      } catch (error) {
        console.error(`Erro ao processar o lead ${doc.id}:`, error)
        // Continua para o próximo lead mesmo se um falhar
      }
    })

    console.log('Total de leads processados:', leads.length)
    
    // Validação final de todos os leads
    const parsed = listLeadsResponseSchema.safeParse(leads)
    if (!parsed.success) {
      console.error('Erro de validação final dos leads:', parsed.error)
      console.error('Dados inválidos:', leads)
      throw new Error('Dados de leads inválidos. Verifique os logs para mais detalhes.')
    }
    
    return parsed.data
  } catch (error) {
    console.error('Erro ao listar leads:', error)
    throw new Error(`Falha ao listar leads: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

export async function listRecentLeads(limit: number = 5): Promise<LeadListItem[]> {
  try {
    const snapshot = await adminDb.collection("leads")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()
    
    const leads: LeadListItem[] = []
    
    snapshot.forEach((doc) => {
      try {
        const data = doc.data()
        const migratedData = migrateLeadData(data)
        
        const leadData = {
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
        }
        
        const parsedLead = leadListItemSchema.safeParse(leadData)
        if (parsedLead.success) {
          leads.push(parsedLead.data)
        }
      } catch (error) {
        console.error(`Erro ao processar o lead ${doc.id}:`, error)
      }
    })

    return leads
  } catch (error) {
    console.error('Erro ao listar leads recentes:', error)
    throw new Error(`Falha ao listar leads recentes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}
