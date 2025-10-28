import { NextRequest, NextResponse } from "next/server";
import { getSmsStatus } from "@/actions/send-sms";

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = params;

    if (!messageId) {
      return NextResponse.json({
        success: false,
        error: "ID da mensagem é obrigatório"
      }, { status: 400 });
    }

    // Consultar status usando a Server Action
    const result = await getSmsStatus(messageId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro na API de status SMS:', error);
    
    return NextResponse.json({
      success: false,
      error: "Erro interno do servidor"
    }, { status: 500 });
  }
}
