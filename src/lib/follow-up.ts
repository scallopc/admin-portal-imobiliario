import { adminDb } from '@/lib/firebase-admin'
import { statusLead } from './constants'

export interface FollowUpLead {
  id: string
  name: string
  email: string
  phone: string
  status: string
  source: string
  nextContact: Date
  createdAt: Date
  updatedAt: Date
}

export interface FollowUpResult {
  leads: FollowUpLead[]
  total: number
  message: string
  debug?: any[]
}

/**
 * Busca leads que precisam de follow-up
 * - Status: "Novo" ou "Contatado" 
 * - Próximo contato já passou
 */
export async function getLeadsForFollowUp(): Promise<FollowUpResult> {
  try {
    const today = new Date()
    
    // Buscar leads com status "Novo", "Contatado" ou "Qualificado"
    const leadsSnapshot = await adminDb
      .collection('leads')
      .where('status', 'in', ['Novo', 'Contatado', 'Qualificado'])
      .get()

    const leadsForFollowUp: FollowUpLead[] = []
    const debugInfo: any[] = []
    
    leadsSnapshot.forEach((doc) => {
      const data = doc.data()
      let nextContact = data.next_contact?.toDate?.() || data.nextContact?.toDate?.() || data.proximo_contato?.toDate?.()
      
      // Se não tem nextContact, criar um baseado no status
      if (!nextContact) {
        const createdDate = data.createdAt?.toDate?.() || data.created_at?.toDate?.() || new Date()
        const daysToAdd = data.status === 'Novo' ? 1 : data.status === 'Contatado' ? 2 : 3 // Novo = +1 dia, Contatado = +2 dias, Qualificado = +3 dias
        nextContact = new Date(createdDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
                
        // Atualizar o lead no Firebase
        adminDb.collection('leads').doc(doc.id).update({
          next_contact: nextContact,
          updated_at: new Date()
        }).catch(err => console.error('Erro ao atualizar lead:', err))
      }
      
      const debug = {
        id: doc.id,
        name: data.name,
        stage: data.status,
        status: data.status,
        nextContact: nextContact?.toISOString(),
        nextContact_raw: data.nextContact,
        proximo_contato_raw: data.proximo_contato,
        isOverdue: nextContact && nextContact <= today,
        today: today.toISOString(),
        autoCreated: !data.nextContact && !data.nextContact
      }
      
      debugInfo.push(debug)
      
      // Verificar se o próximo contato já passou
      if (nextContact && nextContact <= today) {
        leadsForFollowUp.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          status: data.stage || data.status || '',
          source: data.source || '',
          nextContact: nextContact,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        })
      } 
    })

    // Ordenar por próximo contato
    leadsForFollowUp.sort((a, b) => a.nextContact.getTime() - b.nextContact.getTime())

    return {
      leads: leadsForFollowUp,
      total: leadsForFollowUp.length,
      message: `Encontrados ${leadsForFollowUp.length} leads para follow-up`,
      debug: debugInfo // Adicionar info de debug
    }
  } catch (error) {
    console.error('Erro ao buscar leads para follow-up:', error)
    throw new Error('Falha ao buscar leads para follow-up')
  }
}

/**
 * Gera mensagem personalizada para follow-up
 */
export function generateFollowUpMessage(lead: FollowUpLead): string {
  const daysOverdue = Math.ceil(
    (new Date().getTime() - lead.nextContact.getTime()) / (1000 * 60 * 60 * 24)
  )

  const messages = {
    'Novo': `Olá ${lead.name}! 👋\n\nVi seu interesse em nossos imóveis e gostaria de conversar sobre suas necessidades. Temos opções incríveis que podem ser perfeitas para você!\n\nPodemos conversar agora?`,
    
    'Contatado': `Oi ${lead.name}! 😊\n\nPassando para dar continuidade à nossa conversa sobre imóveis. Encontrei algumas opções que podem te interessar!\n\nQue tal conversarmos?`
  }

  const baseMessage = messages[lead.status as keyof typeof messages] || 
    `Olá ${lead.name}! Gostaria de conversar sobre imóveis. Podemos falar agora?`

  if (daysOverdue > 1) {
    return `${baseMessage}\n\n*Nota: Este follow-up está ${daysOverdue} dias atrasado.*`
  }

  return baseMessage
}

/**
 * Gera resumo do follow-up para dashboard
 */
export function generateFollowUpSummary(result: FollowUpResult): string {
  if (result.total === 0) {
    return '✅ Nenhum lead precisa de follow-up hoje!'
  }

  const statusCount = result.leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  let summary = `📋 **Follow-up Pendente**\n\n`
  summary += `**Total:** ${result.total} leads\n\n`
  
  Object.entries(statusCount).forEach(([status, count]) => {
    summary += `• ${status}: ${count} leads\n`
  })

  summary += `\n⏰ **Ações Recomendadas:**\n`
  summary += `• Enviar mensagens personalizadas\n`
  summary += `• Agendar ligações\n`
  summary += `• Atualizar status dos leads\n`

  return summary
}

/**
 * Valida se um lead precisa de follow-up
 */
export function shouldFollowUp(lead: FollowUpLead): boolean {
  const validStatuses = ['Novo', 'Contatado', 'Qualificado']
  const today = new Date()
  
  return (
    validStatuses.includes(lead.status) &&
    lead.nextContact <= today
  )
}

/**
 * Calcula prioridade do follow-up baseado em critérios
 */
export function calculateFollowUpPriority(lead: FollowUpLead): 'alta' | 'média' | 'baixa' {
  const daysOverdue = Math.ceil(
    (new Date().getTime() - lead.nextContact.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Alta prioridade: mais de 3 dias atrasado
  if (daysOverdue > 3) return 'alta'
  
  // Média prioridade: 1-3 dias atrasado
  if (daysOverdue >= 1) return 'média'
  
  // Baixa prioridade: follow-up no prazo
  return 'baixa'
}

/**
 * Explica os critérios para follow-up
 */
export function getFollowUpCriteria(): string {
  return `
📋 **CRITÉRIOS PARA FOLLOW-UP:**

1️⃣ **STATUS**: Lead deve ter status "Novo", "Contatado" ou "Qualificado"
   ❌ Status "Ganho", "Perdido" são ignorados

2️⃣ **DATA**: Campo 'nextContact' deve ser <= hoje
   ✅ Se nextContact = 2024-01-15 e hoje = 2024-01-16 → PRECISA follow-up
   ❌ Se nextContact = 2024-01-17 e hoje = 2024-01-16 → NÃO precisa

3️⃣ **CAMPOS OBRIGATÓRIOS**: 
   ✅ name, email, phone, status, nextContact
   ❌ Se nextContact for null/undefined → IGNORADO

**EXEMPLO:**
- Lead "João" com status "Novo" e nextContact = ontem → ✅ FOLLOW-UP
- Lead "Maria" com status "Qualificado" e nextContact = ontem → ✅ FOLLOW-UP
- Lead "Pedro" com nextContact = amanhã → ❌ IGNORADO
- Lead "Ana" sem nextContact → ❌ IGNORADO
  `
}
