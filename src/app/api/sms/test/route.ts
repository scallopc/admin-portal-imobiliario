import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "API SMS Test está funcionando",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro na API de teste:', error);
    return NextResponse.json({
      success: false,
      error: "Erro interno do servidor"
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const smsDevToken = process.env.SMS_DEV_TOKEN;

    return NextResponse.json({
      success: true,
      message: "API SMS Test POST funcionando",
      env: {
        hasSmsDevToken: !!smsDevToken,
        tokenPrefix: smsDevToken?.substring(0, 8) || 'N/A'
      }
    });
  } catch (error) {
    console.error('Erro na API de teste POST:', error);
    return NextResponse.json({
      success: false,
      error: "Erro interno do servidor"
    }, { status: 500 });
  }
}
