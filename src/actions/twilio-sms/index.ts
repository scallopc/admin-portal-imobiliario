"use server";

import { 
  sendSmsSchema, 
  type SendSmsInput, 
  type SmsResponse,
  type SmsStatus 
} from "./schema";

// Configurações do Twilio (usar variáveis de ambiente)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export async function sendSms(input: SendSmsInput): Promise<SmsResponse> {
  console.log('sendSms chamada com:', { ...input, message: input.message.substring(0, 50) + '...' });
  
  const parsed = sendSmsSchema.safeParse(input);
  if (!parsed.success) {
    console.error('Validação falhou:', parsed.error);
    return {
      success: false,
      error: "Dados inválidos: " + parsed.error.errors.map(e => e.message).join(', ')
    };
  }

  const { to, message, leadId } = parsed.data;

  // Verificar se as credenciais do Twilio estão configuradas
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.error('Credenciais do Twilio não configuradas');
    return {
      success: false,
      error: "Credenciais do Twilio não configuradas. Verifique as variáveis de ambiente."
    };
  }

  try {
    // Preparar o corpo da requisição para a API do Twilio
    const body = new URLSearchParams({
      To: to,
      From: TWILIO_PHONE_NUMBER,
      Body: message
    });

    console.log('Enviando SMS via Twilio API');

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Erro da API Twilio:', response.status, errorData);
      
      let errorMessage = `Erro da API Twilio (${response.status})`;
      if (errorData?.message) {
        errorMessage += `: ${errorData.message}`;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }

    const data = await response.json();
    console.log('SMS enviado com sucesso:', data.sid);

    // Salvar no banco de dados se leadId foi fornecido
    if (leadId) {
      try {
        await saveSmsToDatabase({
          leadId,
          messageId: data.sid,
          to,
          message,
          status: data.status,
          cost: data.price ? parseFloat(data.price) : undefined
        });
      } catch (dbError) {
        console.error('Erro ao salvar SMS no banco:', dbError);
        // Não falhar o envio por causa do erro de banco
      }
    }

    return {
      success: true,
      messageId: data.sid,
      status: data.status,
      cost: data.price ? parseFloat(data.price) : undefined
    };

  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: "Não foi possível conectar à API do Twilio. Verifique sua conexão com a internet."
      };
    }
    
    return {
      success: false,
      error: `Erro ao enviar SMS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

export async function getSmsStatus(messageId: string): Promise<{ success: boolean; data?: SmsStatus; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return {
      success: false,
      error: "Credenciais do Twilio não configuradas"
    };
  }

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${messageId}.json`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Erro ao consultar status: ${response.status}`
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        messageId: data.sid,
        status: data.status,
        errorCode: data.error_code,
        errorMessage: data.error_message,
        dateCreated: data.date_created,
        dateSent: data.date_sent,
        dateUpdated: data.date_updated
      }
    };

  } catch (error) {
    console.error('Erro ao consultar status do SMS:', error);
    return {
      success: false,
      error: `Erro ao consultar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

// Função auxiliar para salvar SMS no banco de dados
async function saveSmsToDatabase(smsData: {
  leadId: string;
  messageId: string;
  to: string;
  message: string;
  status: string;
  cost?: number;
}) {
  // TODO: Implementar salvamento no banco de dados
  // Por enquanto, apenas log
  console.log('SMS salvo no banco (mock):', smsData);
  
  // Aqui você integraria com seu banco de dados
  // Exemplo com Drizzle ORM:
  // await db.insert(smsMessages).values({
  //   leadId: smsData.leadId,
  //   messageId: smsData.messageId,
  //   phoneNumber: smsData.to,
  //   content: smsData.message,
  //   status: smsData.status,
  //   cost: smsData.cost,
  //   sentAt: new Date()
  // });
}

// Templates de SMS pré-definidos
export const SMS_TEMPLATES = {
  FOLLOW_UP_INICIAL: {
    id: "follow_up_inicial",
    name: "Follow-up Inicial",
    content: "Olá {nome}! Sou {corretor} da {imobiliaria}. Vi seu interesse no imóvel {imovel}. Posso te ajudar com mais informações?",
    variables: ["nome", "corretor", "imobiliaria", "imovel"],
    category: "follow_up" as const
  },
  FOLLOW_UP_AGENDAMENTO: {
    id: "follow_up_agendamento",
    name: "Agendamento de Visita",
    content: "Olá {nome}! Que tal agendarmos uma visita ao imóvel {imovel}? Tenho disponibilidade {disponibilidade}. Confirma?",
    variables: ["nome", "imovel", "disponibilidade"],
    category: "follow_up" as const
  },
  FOLLOW_UP_PROPOSTA: {
    id: "follow_up_proposta",
    name: "Proposta Comercial",
    content: "Oi {nome}! Preparei uma proposta especial para o {imovel}. Valor: R$ {valor}. Condições facilitadas. Vamos conversar?",
    variables: ["nome", "imovel", "valor"],
    category: "follow_up" as const
  },
  LEMBRETE_VISITA: {
    id: "lembrete_visita",
    name: "Lembrete de Visita",
    content: "Oi {nome}! Lembrando da nossa visita ao {imovel} hoje às {horario}. Endereço: {endereco}. Nos vemos lá!",
    variables: ["nome", "imovel", "horario", "endereco"],
    category: "reminder" as const
  }
} as const;
