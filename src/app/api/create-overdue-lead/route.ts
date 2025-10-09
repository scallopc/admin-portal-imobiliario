import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    // Criar lead com next_contact no passado (2 dias atrás)
    const overdueLead = {
      name: 'Lead Atrasado - Teste',
      email: 'atrasado@teste.com',
      phone: '+5521999999999',
      status: 'Novo',
      source: 'JadeChat',
      next_contact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
      updated_at: new Date(),
      notes: 'Lead de teste com follow-up atrasado'
    }
    
    const docRef = await adminDb.collection('leads').add(overdueLead)
    
    return NextResponse.json({
      success: true,
      message: 'Lead atrasado criado com sucesso',
      data: { 
        id: docRef.id, 
        ...overdueLead,
        next_contact: overdueLead.next_contact.toISOString(),
        created_at: overdueLead.created_at.toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao criar lead atrasado:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao criar lead atrasado',
      error: (error as Error).message
    }, { status: 500 })
  }
}
