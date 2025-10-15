import { NextRequest, NextResponse } from "next/server";
import { sendSms } from "@/actions/twilio-sms";
import { sendSmsSchema } from "@/actions/twilio-sms/schema";
import { z } from "zod";

const sendBulkSmsSchema = z.object({
  leads: z.array(z.object({
    to: z.string().min(1, "Número de telefone é obrigatório"),
    message: z.string().min(1, "Mensagem é obrigatória"),
    leadId: z.string().optional()
  })).min(1, "Pelo menos um lead é obrigatório")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados de entrada
    const parsed = sendBulkSmsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: "Dados inválidos: " + parsed.error.errors.map(e => e.message).join(', ')
      }, { status: 400 });
    }

    const { leads } = parsed.data;
    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    // Enviar SMS para cada lead
    for (const lead of leads) {
      try {
        // Validar cada SMS individualmente
        const smsValidation = sendSmsSchema.safeParse({
          to: lead.to,
          message: lead.message
        });

        if (!smsValidation.success) {
          results.push({
            leadId: lead.leadId,
            to: lead.to,
            success: false,
            error: "Dados inválidos: " + smsValidation.error.errors.map(e => e.message).join(', ')
          });
          failedCount++;
          continue;
        }

        // Enviar SMS usando a Server Action
        const result = await sendSms(smsValidation.data);

        if (result.success) {
          results.push({
            leadId: lead.leadId,
            to: lead.to,
            success: true,
            messageId: result.messageId,
            status: result.status,
            cost: result.cost
          });
          sentCount++;
        } else {
          results.push({
            leadId: lead.leadId,
            to: lead.to,
            success: false,
            error: result.error
          });
          failedCount++;
        }

        // Pequeno delay entre envios para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.push({
          leadId: lead.leadId,
          to: lead.to,
          success: false,
          error: "Erro interno ao enviar SMS"
        });
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: leads.length,
        sent: sentCount,
        failed: failedCount,
        sentMessages: sentCount,
        results
      }
    });

  } catch (error) {
    console.error('Erro na API de SMS em lote:', error);
    
    return NextResponse.json({
      success: false,
      error: "Erro interno do servidor"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API SMS Bulk está funcionando",
    description: "Envio de SMS em lote para múltiplos leads"
  });
}
