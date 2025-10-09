import { NextRequest, NextResponse } from 'next/server'
import { whatsappService, WhatsAppService } from '@/lib/whatsapp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, message, leadId, leadName, leadStatus, leadSource } = body

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Número de telefone é obrigatório' },
        { status: 400 }
      )
    }

    // Validar e formatar número de telefone
    const formattedPhone = WhatsAppService.validatePhoneNumber(phone)

    let response

    if (message) {
      // Enviar mensagem personalizada
      response = await whatsappService.sendTextMessage(formattedPhone, message)
    } else if (leadId && leadName && leadStatus && leadSource) {
      // Enviar mensagem de follow-up automática
      response = await whatsappService.sendFollowUpMessage({
        name: leadName,
        phone: formattedPhone,
        status: leadStatus,
        source: leadSource
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Mensagem ou dados do lead são obrigatórios' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: {
        messageId: response.messages?.[0]?.id,
        phone: formattedPhone,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem WhatsApp:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Falha ao enviar mensagem',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API WhatsApp funcionando',
    endpoints: {
      'POST /api/whatsapp/send-message': 'Enviar mensagem',
      'POST /api/whatsapp/send-follow-up': 'Enviar follow-up automático'
    }
  })
}
