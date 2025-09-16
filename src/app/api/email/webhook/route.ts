import { NextRequest, NextResponse } from "next/server"
// import { db } from "@/db"
// import { leads } from "@/db/schema"
// import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Aqui você deve implementar a lógica específica do seu provedor de email
    // Exemplo para SendGrid, Resend, etc.
    
    console.log("=== WEBHOOK EMAIL RECEBIDO ===")
    console.log("Dados recebidos:", JSON.stringify(body, null, 2))
    console.log("=============================")

    // Extrair informações do email (ajuste conforme seu provedor)
    const fromEmail = body.from || body.sender || body.email
    const subject = body.subject || ""
    const content = body.text || body.body || body.content || ""
    const timestamp = body.timestamp || new Date().toISOString()

    if (!fromEmail) {
      return NextResponse.json({ error: "Email do remetente não encontrado" }, { status: 400 })
    }

    // Buscar o lead pelo email
    // const lead = await db.query.leads.findFirst({
    //   where: eq(leads.email, fromEmail)
    // })

    // if (!lead) {
    //   console.log(`Lead não encontrado para o email: ${fromEmail}`)
    //   return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 })
    // }

    // Aqui você pode:
    // 1. Salvar a resposta em uma tabela de conversas
    // 2. Atualizar o status do lead
    // 3. Enviar notificação para o usuário
    // 4. Registrar a interação

    console.log(`Email de resposta recebido do lead: ${fromEmail}`)
    console.log(`Assunto: ${subject}`)
    console.log(`Conteúdo: ${content.substring(0, 100)}...`)

    // Atualizar o lead para marcar que respondeu
    // await db.update(leads)
    //   .set({ 
    //     stage: "contacted",
    //     updatedAt: new Date().toISOString()
    //   })
    //   .where(eq(leads.id, lead.id))

    return NextResponse.json({ 
      success: true, 
      message: "Email processado com sucesso"
    })

  } catch (error) {
    console.error("Erro ao processar webhook de email:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

// Para verificação de webhook (alguns provedores exigem)
export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "Webhook de email ativo" 
  })
}

