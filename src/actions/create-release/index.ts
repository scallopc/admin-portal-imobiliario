'use server'

import { adminDb } from '@/lib/firebase-admin'
import { createReleaseSchema, type CreateReleaseInput } from './schema'
import { getUser } from '@/actions/get-user'

export async function createRelease(input: CreateReleaseInput) {
  try {
    const user = await getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const validatedInput = createReleaseSchema.parse(input)
    
    const releaseData = {
      ...validatedInput,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await adminDb.collection('releases').add(releaseData)
    
    return {
      success: true,
      id: docRef.id,
      message: 'Lançamento criado com sucesso'
    }
  } catch (error) {
    console.error('Erro ao criar lançamento:', error)
    
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
