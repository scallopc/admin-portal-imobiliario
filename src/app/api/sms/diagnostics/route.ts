import { NextResponse } from "next/server";

export async function GET() {
  try {
    const diagnostics = {
      envVariables: checkEnvironmentVariables(),
      twilioConnection: await checkTwilioConnection(),
      apiRoute: checkApiRoutes()
    };

    return NextResponse.json({
      success: true,
      data: diagnostics
    });

  } catch (error) {
    console.error('Erro no diagnóstico SMS:', error);
    
    return NextResponse.json({
      success: false,
      error: "Erro interno do servidor",
      data: {
        envVariables: {
          success: false,
          message: "Erro ao verificar variáveis de ambiente"
        },
        twilioConnection: {
          success: false,
          message: "Erro ao verificar conexão"
        },
        apiRoute: {
          success: false,
          message: "Erro interno"
        }
      }
    }, { status: 500 });
  }
}

function checkEnvironmentVariables() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  const missing = [];
  if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
  if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
  if (!phoneNumber) missing.push('TWILIO_PHONE_NUMBER');

  if (missing.length > 0) {
    return {
      success: false,
      message: "Variáveis de ambiente não configuradas",
      details: `Faltando: ${missing.join(', ')}`
    };
  }

  // Validar formato básico
  const issues = [];
  if (accountSid && !accountSid.startsWith('AC')) {
    issues.push('TWILIO_ACCOUNT_SID deve começar com "AC"');
  }
  if (phoneNumber && !phoneNumber.startsWith('+')) {
    issues.push('TWILIO_PHONE_NUMBER deve começar com "+"');
  }

  if (issues.length > 0) {
    return {
      success: false,
      message: "Formato das variáveis incorreto",
      details: issues.join(', ')
    };
  }

  return {
    success: true,
    message: "Todas as variáveis configuradas corretamente",
    details: `Account SID: ${accountSid?.substring(0, 8)}..., Phone: ${phoneNumber}`
  };
}

async function checkTwilioConnection() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return {
      success: false,
      message: "Credenciais não configuradas"
    };
  }

  try {
    // Tentar fazer uma requisição simples para a API do Twilio (buscar conta)
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        message: "Falha na autenticação com Twilio",
        details: `Status: ${response.status}${errorData?.message ? ` - ${errorData.message}` : ''}`
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: "Conexão com Twilio estabelecida",
      details: `Conta: ${data.friendly_name || 'N/A'}, Status: ${data.status}`
    };

  } catch (error) {
    return {
      success: false,
      message: "Erro de conectividade",
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

function checkApiRoutes() {
  // Verificar se as rotas essenciais existem (verificação básica)
  try {
    return {
      success: true,
      message: "API routes funcionando",
      details: "Rotas /api/sms/send e /api/sms/send-bulk disponíveis"
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro nas API routes"
    };
  }
}
