import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Função para converter telefone brasileiro para formato internacional
function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, "");

  // Se já tem código do país (55), retorna com +
  if (cleanPhone.startsWith("55") && cleanPhone.length >= 12) {
    return "+" + cleanPhone;
  }

  // Se é um número brasileiro sem código do país
  if (cleanPhone.length === 11 && cleanPhone.startsWith("11")) {
    return "+55" + cleanPhone;
  }

  // Se é um número brasileiro sem código do país (outros DDDs)
  if (cleanPhone.length === 11) {
    return "+55" + cleanPhone;
  }

  // Se é um número brasileiro sem código do país (10 dígitos)
  if (cleanPhone.length === 10) {
    return "+55" + cleanPhone;
  }

  // Retorna o número limpo com + se não tiver
  return cleanPhone.startsWith("+") ? cleanPhone : "+" + cleanPhone;
}

// Schema de validação local
const sendSmsSchema = z.object({
  to: z
    .string()
    .min(1, "Número de telefone é obrigatório")
    .transform(formatPhoneNumber)
    .refine(phone => /^\+[1-9]\d{1,14}$/.test(phone), {
      message: "Formato de telefone inválido. Use formato: (11) 99999-9999 ou +5521999999999",
    }),
  message: z.string().min(1, "Mensagem é obrigatória").max(1600, "Mensagem muito longa (máximo 1600 caracteres)"),
  leadId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação com Zod
    const parsed = sendSmsSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Validação falhou:", parsed.error);
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos: " + parsed.error.errors.map(e => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { to, message, leadId } = parsed.data;

    // Verificar se DevSMS está configurado
    const devSmsApiKey = process.env.DEVSMS_API_KEY;

    // Envio real com DevSMS
    try {
      // Formatar número removendo o + inicial se existir
      const formattedNumber = to.startsWith("+") ? to.substring(1) : to;

      const response = await fetch("https://api.smsdev.com.br/v1/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: devSmsApiKey,
          type: 9, // tipo 9 = SMS comum
          number: formattedNumber,
          msg: message,
        }),
      });

      const devSmsResponse = await response.json();

      // Verificar se a resposta contém um campo de erro
      if (!response.ok || devSmsResponse.situacao === "INVALID_KEY" || devSmsResponse.situacao === "INVALID_TYPE") {
        throw new Error(devSmsResponse.descricao || `Erro ao enviar SMS: ${JSON.stringify(devSmsResponse)}`);
      }

      return NextResponse.json({
        success: true,
        messageId: devSmsResponse.id || devSmsResponse.messageId,
        status: devSmsResponse.status || "sent",
        cost: devSmsResponse.cost || 0.15,
        mode: "production",
        provider: "devsms",
      });
    } catch (devSmsError) {
      console.error("Erro ao enviar SMS via DevSMS:", devSmsError);

      return NextResponse.json(
        {
          success: false,
          error: `Erro ao enviar SMS: ${devSmsError instanceof Error ? devSmsError.message : "Erro desconhecido"}`,
          mode: "production",
          provider: "devsms",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("=== ERRO NA API DE SMS ===");
    console.error("Tipo do erro:", typeof error);
    console.error("Erro:", error);
    console.error("Stack:", error instanceof Error ? error.stack : "N/A");

    // Verificar se é erro de parsing JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Formato JSON inválido",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Erro interno do servidor: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API SMS está funcionando",
    endpoints: {
      send: "POST /api/sms/send",
      status: "GET /api/sms/status/[messageId]",
    },
  });
}
