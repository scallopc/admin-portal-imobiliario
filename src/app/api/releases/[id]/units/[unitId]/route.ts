import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; unitId: string } }
) {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    // Buscar o release atual
    const releaseDoc = await adminDb.collection('releases').doc(params.id).get()
    if (!releaseDoc.exists) {
      return NextResponse.json({ error: 'Release não encontrado' }, { status: 404 })
    }

    const releaseData = releaseDoc.data()
    const units = releaseData?.units || []

    // Encontrar e atualizar a unit específica
    const updatedUnits = units.map((unit: any) => {
      if (unit.id === params.unitId) {
        return { ...unit, ...body, updatedAt: new Date().toISOString() }
      }
      return unit
    })

    // Atualizar o documento do release com as units modificadas
    await adminDb.collection('releases').doc(params.id).update({
      units: updatedUnits,
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro ao atualizar unidade' }, { status: 500 })
  }
}
