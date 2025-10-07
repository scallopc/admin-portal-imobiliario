import { NextRequest, NextResponse } from 'next/server'
import { getLeadsForFollowUp, generateFollowUpMessage, generateFollowUpSummary } from '@/lib/follow-up'

// Configuração do cron job
export const config = {
  runtime: 'nodejs',
}

export async function GET(request: NextRequest) {
  // Verificar se é uma chamada do cron job
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    
    // Buscar leads para follow-up
    const result = await getLeadsForFollowUp()
    
    if (result.total === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum follow-up necessário',
        data: result
      })
    }
    
    // Processar cada lead
    const processedLeads = result.leads.map(lead => {
      const message = generateFollowUpMessage(lead)
      
      return {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        status: lead.status,
        message,
        priority: calculatePriority(lead.nextContact),
        daysOverdue: Math.ceil(
          (new Date().getTime() - lead.nextContact.getTime()) / (1000 * 60 * 60 * 24)
        )
      }
    })

    // Gerar resumo
    const summary = generateFollowUpSummary(result)
    
    // Aqui você pode integrar com:
    // - WhatsApp Business API
    // - Telegram Bot
    // - Email service
    // - Sistema de notificações interno
    
    
    // Simular envio de notificações
    await simulateNotifications(processedLeads)

    return NextResponse.json({
      success: true,
      message: `Follow-up processado para ${result.total} leads`,
      data: {
        total: result.total,
        processed: processedLeads.length,
        summary,
        leads: processedLeads
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Erro no follow-up automatizado:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Falha no processamento do follow-up',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

function calculatePriority(proximoContato: Date): 'alta' | 'média' | 'baixa' {
  const daysOverdue = Math.ceil(
    (new Date().getTime() - proximoContato.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysOverdue > 3) return 'alta'
  if (daysOverdue >= 1) return 'média'
  return 'baixa'
}

async function simulateNotifications(leads: any[]) {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Aqui você implementaria as integrações reais:
  
  // 1. WhatsApp Business API
  leads.forEach(lead => {
    console.log(`   → ${lead.name}: ${lead.message.substring(0, 50)}...`)
  })
  
  // 2. Notificações internas
  leads.forEach(lead => {
    console.log(`   → Notificação: Follow-up ${lead.priority} para ${lead.name}`)
  })
  
  // 3. Logs para auditoria
  leads.forEach(lead => {
    console.log(`   → Log: ${lead.name} - ${lead.daysOverdue} dias atrasado`)
  })
}
