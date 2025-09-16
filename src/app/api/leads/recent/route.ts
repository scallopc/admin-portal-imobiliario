import { NextResponse } from 'next/server'
import { listRecentLeads } from '@/actions/list-leads'

export async function GET() {
  try {
    const data = await listRecentLeads()
    return NextResponse.json(data)
  } catch (e) {
    return new NextResponse(null, { status: 500 })
  }
}
