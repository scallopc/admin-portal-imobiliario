'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { adminAuth } from '@/lib/firebase-admin'
import { signInSchema, type SignInInput } from './schema'

const IDP_ENDPOINT = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword'

type IdpResponse = {
  idToken: string
  refreshToken: string
  expiresIn: string
  localId: string
  email: string
  registered: boolean
}

export async function signInEmailPassword(input: SignInInput): Promise<{ uid: string; email: string | null }> {
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid credentials payload')

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY')

  const res = await fetch(`${IDP_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...parsed.data, returnSecureToken: true }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => undefined)
    const message = err?.error?.message ?? 'AUTH_ERROR'
    throw new Error(message)
  }

  const data: IdpResponse = await res.json()

  const expiresInMs = 7 * 24 * 60 * 60 * 1000
  const sessionCookie = await adminAuth.createSessionCookie(data.idToken, { expiresIn: expiresInMs })

  const cookieStore = await cookies()
  cookieStore.set('session', sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(expiresInMs / 1000),
  })
  
  console.log('Session cookie set successfully')

  return { uid: data.localId, email: data.email ?? null }
}
