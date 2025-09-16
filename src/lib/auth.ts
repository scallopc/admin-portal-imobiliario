import { cookies } from "next/headers"
import { adminAuth } from "@/lib/firebase-admin"

export type Session = {
  user: {
    id: string
    email?: string | null
  } | null
}

export async function getSession(): Promise<Session> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")?.value
    
    if (!sessionCookie) {
      return { user: null }
    }
    
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    
    return { 
      user: { 
        id: String(decoded.uid), 
        email: decoded.email ? String(decoded.email) : null 
      } 
    }
  } catch (error) {
    console.error('Error verifying session:', error)
    return { user: null }
  }
}
