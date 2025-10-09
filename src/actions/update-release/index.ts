'use server'

import { adminDb } from '@/lib/firebase-admin'
import { updateReleaseSchema, type UpdateReleaseInput } from './schema'
import { getUser } from '@/actions/get-user'

export async function updateRelease(input: UpdateReleaseInput) {
  try {
    const user = await getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const validatedInput = updateReleaseSchema.parse(input)
    const { id, ...updateData } = validatedInput
    
    const releaseRef = adminDb.collection('releases').doc(id)
    const releaseDoc = await releaseRef.get()
    
    if (!releaseDoc.exists) {
      throw new Error('Lançamento não encontrado')
    }

    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    await releaseRef.update(updatedData)
    
    return {
      success: true,
      message: 'Lançamento atualizado com sucesso'
    }
  } catch (error) {
    console.error('Erro ao atualizar lançamento:', error)
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}
