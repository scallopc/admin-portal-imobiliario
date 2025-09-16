'use server'

import { adminAuth } from '@/lib/firebase-admin'
import { adminDb } from '@/lib/firebase-admin'
import { updateUserSchema, type UpdateUserInput } from './schema'
import { cookies } from 'next/headers'

export async function updateUser(data: UpdateUserInput) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar sessão
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie)
    const uid = decodedToken.uid

    // Validar dados
    const parsed = updateUserSchema.safeParse(data)
    if (!parsed.success) {
      throw new Error(`Dados inválidos: ${parsed.error.errors.map(e => e.message).join(', ')}`)
    }

    const updateData = parsed.data

    // Atualizar no Firebase Auth
    let sessionStillValid = true
    if (updateData.email) {
      await adminAuth.updateUser(uid, {
        email: updateData.email,
        displayName: updateData.name
      })
      
      // Verificar se a sessão ainda é válida após alterar o email
      try {
        await adminAuth.verifySessionCookie(sessionCookie, true)
        sessionStillValid = true
      } catch (error) {
        sessionStillValid = false
      }
      
      console.log('Email updated successfully, session still valid:', sessionStillValid)
    } else if (updateData.name) {
      await adminAuth.updateUser(uid, {
        displayName: updateData.name
      })
      console.log('Name updated successfully')
    }

    // Atualizar no Firestore
    await adminDb.collection('users').doc(uid).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    })

    return {
      success: true,
      message: 'Perfil atualizado com sucesso',
      emailChanged: !!updateData.email,
      sessionStillValid
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    throw new Error(`Falha ao atualizar perfil: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}
