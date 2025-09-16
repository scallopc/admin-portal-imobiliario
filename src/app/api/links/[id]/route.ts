import { NextResponse } from 'next/server'
import { deleteLink } from '@/actions/delete-link'
import { getLink } from '@/actions/get-link'
import { updateLink } from '@/actions/update-link'

export const dynamic = 'force-dynamic'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await deleteLink(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Falha ao excluir link' }, { status: 500 })
  }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const link = await getLink({ id: params.id })
    return NextResponse.json(link)
  } catch (error) {
    return NextResponse.json({ message: 'Falha ao carregar link' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    await updateLink(params.id, body)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Falha ao atualizar link' }, { status: 500 })
  }
}


