import { NextResponse } from 'next/server'
import { listLinks } from '@/actions/list-links'
import { createLink } from '@/actions/create-link'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const links = await listLinks()
    return NextResponse.json(links)
  } catch (error) {
    return NextResponse.json({ message: 'Falha ao carregar links' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await createLink(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Falha ao criar link' }, { status: 500 })
  }
}


