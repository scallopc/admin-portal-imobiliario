import { NextRequest, NextResponse } from 'next/server'
import { getLeadsForFollowUp, generateFollowUpSummary } from '@/lib/follow-up'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const result = await getLeadsForFollowUp()
    const summary = generateFollowUpSummary(result)
    
    return NextResponse.json({
      success: true,
      data: result,
      summary,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro no follow-up:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Falha ao processar follow-up',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, action, notes } = body

    if (!leadId || !action) {
      return NextResponse.json(
        { success: false, error: 'leadId e action são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar lead baseado na ação
    let updateData: any = {}
    
    switch (action) {
      case 'contacted':
        updateData = {
          status: 'Contatado',
          next_contact: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 dias
          updated_at: new Date()
        }
        break
        
      case 'qualified':
        updateData = {
          status: 'Qualificado',
          next_contact: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 dias
          updated_at: new Date()
        }
        break
        
      case 'reschedule':
        const newDate = new Date(body.newDate)
        updateData = {
          next_contact: newDate,
          updated_at: new Date()
        }
        break
        
      case 'lost':
        updateData = {
          status: 'Perdido',
          updated_at: new Date()
        }
        break
        
      case 'send_message':
        // Verificar se WhatsApp está configurado
        if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'WhatsApp não configurado',
              message: 'Configure WHATSAPP_ACCESS_TOKEN e WHATSAPP_PHONE_NUMBER_ID nas variáveis de ambiente'
            },
            { status: 400 }
          )
        }
        
        // Enviar mensagem via WhatsApp
        try {
          const leadDoc = await adminDb.collection('leads').doc(leadId).get()
          if (!leadDoc.exists) {
            return NextResponse.json(
              { success: false, error: 'Lead não encontrado' },
              { status: 404 }
            )
          }
          
          const leadData = leadDoc.data()!
          const whatsappResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/whatsapp/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: leadData.phone,
              leadId,
              leadName: leadData.name,
              leadStatus: leadData.status,
              leadSource: leadData.source
            })
          })
          
          const whatsappResult = await whatsappResponse.json()
          
          if (!whatsappResult.success) {
            return NextResponse.json(
              { success: false, error: 'Erro ao enviar mensagem WhatsApp', details: whatsappResult.error },
              { status: 500 }
            )
          }
          
          // Atualizar timestamp após envio bem-sucedido
          updateData = {
            updated_at: new Date(),
            last_whatsapp_sent: new Date()
          }
          
        } catch (error) {
          console.error('Erro ao enviar WhatsApp:', error)
          return NextResponse.json(
            { success: false, error: 'Erro ao enviar mensagem WhatsApp' },
            { status: 500 }
          )
        }
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Ação inválida' },
          { status: 400 }
        )
    }

    // Adicionar notas se fornecidas
    if (notes) {
      updateData.notes = notes
    }

    await adminDb
      .collection('leads')
      .doc(leadId)
      .update(updateData)

    return NextResponse.json({
      success: true,
      message: `Lead ${action} com sucesso`,
      data: updateData
    })

  } catch (error) {
    console.error('Erro ao processar ação do follow-up:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Falha ao processar ação',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
