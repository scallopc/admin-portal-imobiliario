import { NextResponse } from 'next/server'
import { getDashboardMetrics } from '@/actions/get-dashboard-metrics'

export async function GET() {
  try {
    const data = await getDashboardMetrics()
    return NextResponse.json(data)
  } catch (e) {
    return new NextResponse(null, { status: 500 })
  }
}
