import { NextRequest, NextResponse } from "next/server";
import { sendSms } from "@/actions/twilio-sms";
import { sendSmsSchema } from "@/actions/twilio-sms/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados de entrada
    const parsed = sendSmsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: "Dados inválidos: " + parsed.error.errors.map(e => e.message).join(', ')
      }, { status: 400 });
    }

    // Enviar SMS usando a Server Action
    const result = await sendSms(parsed.data);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        status: result.status,
        cost: result.cost
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro na API de SMS:', error);
    
    return NextResponse.json({
      success: false,
      error: "Erro interno do servidor"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API SMS está funcionando",
    endpoints: {
      send: "POST /api/sms/send",
      status: "GET /api/sms/status/[messageId]"
    }
  });
}
