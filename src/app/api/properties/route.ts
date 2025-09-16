import { NextResponse } from "next/server"
import { listProperties } from "@/actions/list-properties"
import { createProperty } from "@/actions/create-property"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const data = await listProperties()
    return NextResponse.json(data)
  } catch (e) {
    console.error('Erro na API GET /api/properties:', e);
    if (e instanceof Error) {
      return NextResponse.json({ message: e.message }, { status: 500 })
    }
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session.user) return new NextResponse(null, { status: 401 })
    const payload = await req.json()
    const result = await createProperty({ ...payload, listedBy: session.user.id })
    return NextResponse.json(result, { status: 201 })
  } catch (e) {
    if (e instanceof Error) {
      if (e.message?.toLowerCase().includes("invalid")) {
        return NextResponse.json({ message: e.message }, { status: 400 })
      }
      return NextResponse.json({ message: e.message }, { status: 500 })
    }
    return new NextResponse(null, { status: 500 })
  }
}
