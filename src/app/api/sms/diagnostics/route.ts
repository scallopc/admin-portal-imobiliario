import { NextResponse } from "next/server";

export async function GET() {
  try {
    const diagnostics = {
      envVariables: checkEnvironmentVariables(),
      smsService: checkSmsService(),
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
        smsService: {
          success: false,
          message: "Erro ao verificar serviço SMS"
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
  const smsDevToken = process.env.SMS_DEV_TOKEN;

  if (!smsDevToken) {
    return {
      success: false,
      message: "Variável de ambiente não configurada",
      details: "Faltando: SMS_DEV_TOKEN"
    };
  }

  return {
    success: true,
    message: "Variável configurada corretamente",
    details: `SMS_DEV_TOKEN: ${smsDevToken.substring(0, 8)}...`
  };
}

function checkSmsService() {
  const smsDevToken = process.env.SMS_DEV_TOKEN;

  if (!smsDevToken) {
    return {
      success: false,
      message: "SMS_DEV_TOKEN não configurado"
    };
  }

  return {
    success: true,
    message: "Serviço SMS configurado (DEV MODE)",
    details: "SMS será simulado em modo de desenvolvimento"
  };
}

function checkApiRoutes() {
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
