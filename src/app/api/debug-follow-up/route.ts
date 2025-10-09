import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {    
    const today = new Date()
    
    // Buscar TODOS os leads primeiro
    const allLeadsSnapshot = await adminDb.collection('leads').get()
    
    const allLeads: any[] = []
    allLeadsSnapshot.forEach((doc) => {
      const data = doc.data()
      allLeads.push({
        id: doc.id,
        name: data.name,
        status: data.status || data.stage,
        source: data.source,
        created_at: data.created_at?.toDate?.() || data.createdAt?.toDate?.() || 'N/A',
        next_contact: data.next_contact?.toDate?.() || data.proximo_contato?.toDate?.() || 'N/A',
        has_next_contact: !!(data.next_contact || data.proximo_contato)
      })
    })
    
    // Agora buscar leads com status específico
    const statusLeadsSnapshot = await adminDb
      .collection('leads')
      .where('status', 'in', ['Novo', 'Contatado', 'Qualificado'])
      .get()
        
    const statusLeads: any[] = []
    statusLeadsSnapshot.forEach((doc) => {
      const data = doc.data()
      const nextContact = data.next_contact?.toDate?.() || data.proximo_contato?.toDate?.()
      const isOverdue = nextContact && nextContact <= today
      
      statusLeads.push({
        id: doc.id,
        name: data.name,
        status: data.status,
        next_contact: nextContact?.toISOString() || 'N/A',
        is_overdue: isOverdue,
        days_since_created: nextContact ? Math.ceil((today.getTime() - nextContact.getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'
      })
    })
    
    return NextResponse.json({
      success: true,
      message: 'Debug completo',
      data: {
        today: today.toISOString(),
        total_leads: allLeads.length,
        all_leads: allLeads,
        status_leads: statusLeads.length,
        status_leads_data: statusLeads,
        overdue_leads: statusLeads.filter(lead => lead.is_overdue)
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro no debug',
      error: (error as Error).message
    }, { status: 500 })
  }
}
