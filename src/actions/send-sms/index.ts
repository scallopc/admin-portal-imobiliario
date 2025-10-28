"use server";

import { sendSmsSchema, type SendSmsInput, type SmsResponse, type SmsStatus } from "./schema";

const SMS_DEV_TOKEN = process.env.SMS_DEV_TOKEN;

export async function sendSms(input: SendSmsInput): Promise<SmsResponse> {
  const parsed = sendSmsSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Validação falhou:", parsed.error);
    return {
      success: false,
      error: "Dados inválidos: " + parsed.error.errors.map(e => e.message).join(", "),
    };
  }

  const { to, message, leadId } = parsed.data;

  if (!SMS_DEV_TOKEN) {
    console.warn("SMS_DEV_TOKEN não configurado - usando modo de desenvolvimento");
    // Continuar em modo de desenvolvimento mesmo sem token
  }

  try {
    const messageId = `SMS_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    if (leadId) {
      try {
        await saveSmsToDatabase({
          leadId,
          messageId,
          to,
          message,
          status: "sent",
          cost: 0.0075,
        });
      } catch (dbError) {
        console.error("Erro ao salvar SMS no banco:", dbError);
      }
    }

    return {
      success: true,
      messageId,
      status: "sent",
      cost: 0.0075,
    };
  } catch (error) {
    console.error("Erro ao enviar SMS:", error);

    return {
      success: false,
      error: `Erro ao enviar SMS: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

export async function getSmsStatus(messageId: string): Promise<{ success: boolean; data?: SmsStatus; error?: string }> {
  if (!SMS_DEV_TOKEN) {
    return {
      success: false,
      error: "SMS_DEV_TOKEN não configurado",
    };
  }

  try {
    return {
      success: true,
      data: {
        messageId,
        status: "delivered",
        dateCreated: new Date().toISOString(),
        dateSent: new Date().toISOString(),
        dateUpdated: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Erro ao consultar status do SMS:", error);
    return {
      success: false,
      error: `Erro ao consultar status: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

async function saveSmsToDatabase(smsData: {
  leadId: string;
  messageId: string;
  to: string;
  message: string;
  status: string;
  cost?: number;
}) {}

export const SMS_TEMPLATES = {
  FOLLOW_UP_INICIAL: {
    id: "follow_up_inicial",
    name: "Follow-up Inicial",
    content:
      "Olá {nome}! Sou {corretor} da {imobiliaria}. Vi seu interesse no imóvel {imovel}. Posso te ajudar com mais informações?",
    variables: ["nome", "corretor", "imobiliaria", "imovel"],
    category: "follow_up" as const,
  },
  FOLLOW_UP_AGENDAMENTO: {
    id: "follow_up_agendamento",
    name: "Agendamento de Visita",
    content:
      "Olá {nome}! Que tal agendarmos uma visita ao imóvel {imovel}? Tenho disponibilidade {disponibilidade}. Confirma?",
    variables: ["nome", "imovel", "disponibilidade"],
    category: "follow_up" as const,
  },
  FOLLOW_UP_PROPOSTA: {
    id: "follow_up_proposta",
    name: "Proposta Comercial",
    content:
      "Oi {nome}! Preparei uma proposta especial para o {imovel}. Valor: R$ {valor}. Condições facilitadas. Vamos conversar?",
    variables: ["nome", "imovel", "valor"],
    category: "follow_up" as const,
  },
  LEMBRETE_VISITA: {
    id: "lembrete_visita",
    name: "Lembrete de Visita",
    content: "Oi {nome}! Lembrando da nossa visita ao {imovel} hoje às {horario}. Endereço: {endereco}. Nos vemos lá!",
    variables: ["nome", "imovel", "horario", "endereco"],
    category: "reminder" as const,
  },
} as const;
