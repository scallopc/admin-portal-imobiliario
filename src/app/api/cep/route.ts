import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const querySchema = z.object({
  cep: z.string().regex(/^\d{8}$/)
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cep = (searchParams.get("cep") || "").replace(/\D/g, "")

  const parsed = querySchema.safeParse({ cep })
  if (!parsed.success) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 })
  }

  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { next: { revalidate: 0 } })
  if (!res.ok) {
    return NextResponse.json({ error: "Falha ao consultar CEP" }, { status: 502 })
  }

  const data = await res.json()
  if (data?.erro) {
    return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 })
  }

  const address = {
    street: String(data.logradouro || ""),
    neighborhood: String(data.bairro || ""),
    city: String(data.localidade || ""),
    state: String(data.uf || ""),
    zipCode: cep,
    country: "Brasil",
  }

  return NextResponse.json(address)
}
