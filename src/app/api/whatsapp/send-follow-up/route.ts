import { NextRequest, NextResponse } from 'next/server'
import { whatsappService, WhatsAppService } from '@/lib/whatsapp'
import { getLeadsForFollowUp } from '@/lib/follow-up'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, sendToAll = false } = body

    if (leadId) {
      // Enviar follow-up para lead específico
      return await sendFollowUpToLead(leadId)
    } else if (sendToAll) {
      // Enviar follow-up para todos os leads pendentes
      return await sendFollowUpToAllLeads()
    } else {
      return NextResponse.json(
        { success: false, error: 'leadId ou sendToAll é obrigatório' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ Erro no follow-up WhatsApp:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Falha no follow-up',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

async function sendFollowUpToLead(leadId: string) {
  try {
    // Buscar dados do lead (você pode implementar uma função específica para isso)
    // Por enquanto, vou simular os dados
    const leadData = {
      name: 'Lead Teste',
      phone: '+5521999999999',
      status: 'Novo',
      source: 'JadeChat'
    }

    const formattedPhone = WhatsAppService.validatePhoneNumber(leadData.phone)
    
    const response = await whatsappService.sendFollowUpMessage({
      name: leadData.name,
      phone: formattedPhone,
      status: leadData.status,
      source: leadData.source
    })

    return NextResponse.json({
      success: true,
      message: 'Follow-up enviado com sucesso',
      data: {
        leadId,
        messageId: response.messages?.[0]?.id,
        phone: formattedPhone,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    throw error
  }
}

async function sendFollowUpToAllLeads() {
  try {
    // Buscar todos os leads que precisam de follow-up
    const followUpResult = await getLeadsForFollowUp()
    
    if (followUpResult.leads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum lead precisa de follow-up no momento',
        data: {
          totalLeads: 0,
          sentMessages: 0
        }
      })
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    // Enviar mensagem para cada lead
    for (const lead of followUpResult.leads) {
      try {
        const formattedPhone = WhatsAppService.validatePhoneNumber(lead.phone)
        
        const response = await whatsappService.sendFollowUpMessage({
          name: lead.name,
          phone: formattedPhone,
          status: lead.status,
          source: lead.source
        })

        results.push({
          leadId: lead.id,
          name: lead.name,
          phone: formattedPhone,
          status: 'success',
          messageId: response.messages?.[0]?.id
        })
        
        successCount++
        
        // Pequena pausa entre mensagens para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`❌ Erro ao enviar para ${lead.name}:`, error)
        
        results.push({
          leadId: lead.id,
          name: lead.name,
          phone: lead.phone,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
        
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Follow-up processado: ${successCount} sucessos, ${errorCount} erros`,
      data: {
        totalLeads: followUpResult.leads.length,
        sentMessages: successCount,
        errors: errorCount,
        results
      }
    })

  } catch (error) {
    throw error
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API WhatsApp Follow-up funcionando',
    endpoints: {
      'POST /api/whatsapp/send-follow-up': 'Enviar follow-up',
      'POST /api/whatsapp/send-follow-up?sendToAll=true': 'Enviar follow-up para todos'
    }
  })
}
