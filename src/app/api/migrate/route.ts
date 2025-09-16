import { NextResponse } from 'next/server'
import { migrateData } from '@/actions/migrate-data'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const result = await migrateData()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error migrating data:', error)
    return NextResponse.json(
      { message: 'Falha na migração dos dados' }, 
      { status: 500 }
    )
  }
}
