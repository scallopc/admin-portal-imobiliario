import { NextResponse } from 'next/server'
import { getLead } from '@/actions/get-lead'
import { updateLead } from '@/actions/update-lead'
import { deleteLead } from '@/actions/delete-lead'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const lead = await getLead({ id: params.id })
    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error fetching lead:', error)
    return NextResponse.json({ message: 'Lead não encontrado' }, { status: 404 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const result = await updateLead({ id: params.id }, body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json({ message: 'Falha ao atualizar lead' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await deleteLead({ id: params.id })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json({ message: 'Falha ao excluir lead' }, { status: 500 })
  }
}


