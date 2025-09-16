import { NextResponse } from 'next/server'
import { createLead } from '@/actions/create-lead'
import { listLeads } from '@/actions/list-leads'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const leads = await listLeads()
    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json({ message: 'Falha ao carregar leads' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await createLead(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json({ message: 'Falha ao criar lead' }, { status: 500 })
  }
}


