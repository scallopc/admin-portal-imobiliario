import { NextRequest, NextResponse } from 'next/server'
import { deleteRelease } from '@/actions/delete-release'
import { getReleaseById } from '@/actions/get-releases'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const release = await getReleaseById(params.id)
    if (!release) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 })
    }

    return NextResponse.json(release)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro ao buscar lançamento' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    console.log('Body recebido na API:', body)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    const payload: Record<string, any> = {}
    if (typeof body.title === 'string') payload.title = body.title
    if (typeof body.slug === 'string') payload.slug = body.slug
    if (typeof body.description === 'string') payload.description = body.description
    if (typeof body.propertyType === 'string') payload.propertyType = body.propertyType
    if (Array.isArray(body.images)) payload.images = body.images
    if (Array.isArray(body.floorPlans)) payload.floorPlans = body.floorPlans
    if (typeof body.developer === 'string') payload.developer = body.developer
    if (body.address && typeof body.address === 'object') payload.address = body.address
    if (typeof body.seo === 'string') payload.seo = body.seo
    if (Array.isArray(body.features)) payload.features = body.features
    if (typeof body.videoUrl === 'string') payload.videoUrl = body.videoUrl
    if (typeof body.virtualTourUrl === 'string') payload.virtualTourUrl = body.virtualTourUrl
    if (typeof body.status === 'string') payload.status = body.status

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 })
    }

    console.log('Payload final que será salvo:', payload)
    await adminDb.collection('releases').doc(params.id).set(payload, { merge: true })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro ao atualizar lançamento' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteRelease(params.id)
    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de delete release:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
