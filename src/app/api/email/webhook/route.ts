import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db"
// import { leads } from "@/db/schema"
// import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extrair informações do email (ajuste conforme seu provedor)
    const fromEmail = body.from || body.sender || body.email;
    const subject = body.subject || "";
    const content = body.text || body.body || body.content || "";
    const timestamp = body.timestamp || new Date().toISOString();

    if (!fromEmail) {
      return NextResponse.json({ error: "Email do remetente não encontrado" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Email processado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao processar webhook de email:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// Para verificação de webhook (alguns provedores exigem)
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook de email ativo",
  });
}
