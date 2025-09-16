import { NextResponse } from 'next/server'
import { listProperties } from '@/actions/list-properties'

export async function GET() {
  try {
    const data = await listProperties()
    return NextResponse.json(data)
  } catch (e) {
    return new NextResponse(null, { status: 500 })
  }
}
