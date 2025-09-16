'use server'

import { adminAuth } from '@/lib/firebase-admin'
import { adminDb } from '@/lib/firebase-admin'
import { userSchema, type User } from './schema'
import { cookies } from 'next/headers'

export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return null
    }

    // Verificar sessão
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie)
    const uid = decodedToken.uid

    // Buscar dados do usuário no Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get()
    
    if (!userDoc.exists) {
      // Se não existe, criar com dados básicos do Firebase Auth
      const userRecord = await adminAuth.getUser(uid)
      const userData = {
        id: uid,
        email: userRecord.email || '',
        name: userRecord.displayName || userRecord.email?.split('@')[0] || 'Usuário',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await adminDb.collection('users').doc(uid).set(userData)
      
      // Retornar dados serializáveis
      const parsed = userSchema.safeParse(userData)
      if (!parsed.success) {
        console.error('Erro ao validar dados do usuário criado:', parsed.error)
        return null
      }
      
      return parsed.data
    }

    const userData = userDoc.data()
    
    // Garantir que os dados sejam objetos simples serializáveis
    const serializableData = {
      id: uid,
      email: userData?.email || '',
      name: userData?.name || '',
      createdAt: userData?.createdAt || new Date().toISOString(),
      updatedAt: userData?.updatedAt || new Date().toISOString(),
    }
    
    const parsed = userSchema.safeParse(serializableData)

    if (!parsed.success) {
      console.error('Erro ao validar dados do usuário:', parsed.error)
      return null
    }

    return parsed.data
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }
}
