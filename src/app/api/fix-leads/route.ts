import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    // Buscar todos os leads
    const leadsSnapshot = await adminDb.collection('leads').get()
    
    let fixed = 0
    let alreadyFixed = 0
    const results: any[] = []
    
    for (const doc of leadsSnapshot.docs) {
      const data = doc.data()
      const leadId = doc.id
      
      // Verificar se já tem next_contact
      if (data.next_contact) {
        alreadyFixed++
        results.push({
          id: leadId,
          name: data.name,
          status: 'Já tem next_contact',
          next_contact: data.next_contact.toDate().toISOString()
        })
        continue
      }
      
      // Criar next_contact baseado no status/stage
      const createdDate = data.created_at?.toDate() || data.createdAt?.toDate() || new Date()
      const stage = data.stage || data.status
      const daysToAdd = stage === 'Novo' ? 1 : stage === 'Contatado' ? 2 : 3 // Novo = +1 dia, Contatado = +2 dias, Qualificado = +3 dias
      const next_contact = new Date(createdDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
      
      // Atualizar o lead
      await adminDb.collection('leads').doc(leadId).update({
        next_contact: next_contact,
        updated_at: new Date()
      })
      
      fixed++
      results.push({
        id: leadId,
        name: data.name,
        status: data.stage || data.status,
        action: 'Corrigido',
        next_contact: next_contact.toISOString(),
        created_at: createdDate.toISOString()
      })
      
    }
    
    return NextResponse.json({
      success: true,
      message: `Correção concluída: ${fixed} leads corrigidos, ${alreadyFixed} já estavam corretos`,
      data: {
        total: leadsSnapshot.size,
        fixed,
        alreadyFixed,
        results
      }
    })
    
  } catch (error) {
    console.error('❌ Erro na correção:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Falha na correção',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
