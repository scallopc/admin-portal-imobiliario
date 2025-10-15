"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Settings } from "lucide-react";

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: string;
}

interface DiagnosticsData {
  envVariables: DiagnosticResult;
  twilioConnection: DiagnosticResult;
  apiRoute: DiagnosticResult;
}

export function SmsDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/sms/diagnostics", {
        method: "GET"
      });
      
      const result = await response.json();
      setDiagnostics(result.data);
    } catch (error) {
      setDiagnostics({
        envVariables: {
          success: false,
          message: "Erro ao verificar variáveis de ambiente"
        },
        twilioConnection: {
          success: false,
          message: "Erro de conexão"
        },
        apiRoute: {
          success: false,
          message: "Erro na API"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "OK" : "Erro"}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Diagnóstico SMS (Twilio)
            </CardTitle>
            <CardDescription>
              Verificar configuração e conectividade do serviço SMS
            </CardDescription>
          </div>
          <Button 
            onClick={runDiagnostics} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Executar Diagnóstico
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!diagnostics && !loading && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Clique em "Executar Diagnóstico" para verificar a configuração do SMS.
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Executando diagnóstico...</span>
          </div>
        )}

        {diagnostics && (
          <div className="space-y-4">
            {/* Variáveis de Ambiente */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(diagnostics.envVariables.success)}
                <div>
                  <h4 className="font-medium">Variáveis de Ambiente</h4>
                  <p className="text-sm text-muted-foreground">
                    {diagnostics.envVariables.message}
                  </p>
                  {diagnostics.envVariables.details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {diagnostics.envVariables.details}
                    </p>
                  )}
                </div>
              </div>
              {getStatusBadge(diagnostics.envVariables.success)}
            </div>

            {/* Conexão Twilio */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(diagnostics.twilioConnection.success)}
                <div>
                  <h4 className="font-medium">Conexão com Twilio</h4>
                  <p className="text-sm text-muted-foreground">
                    {diagnostics.twilioConnection.message}
                  </p>
                  {diagnostics.twilioConnection.details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {diagnostics.twilioConnection.details}
                    </p>
                  )}
                </div>
              </div>
              {getStatusBadge(diagnostics.twilioConnection.success)}
            </div>

            {/* API Route */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(diagnostics.apiRoute.success)}
                <div>
                  <h4 className="font-medium">API Routes</h4>
                  <p className="text-sm text-muted-foreground">
                    {diagnostics.apiRoute.message}
                  </p>
                  {diagnostics.apiRoute.details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {diagnostics.apiRoute.details}
                    </p>
                  )}
                </div>
              </div>
              {getStatusBadge(diagnostics.apiRoute.success)}
            </div>

            {/* Instruções de Configuração */}
            {!diagnostics.envVariables.success && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Configuração necessária:</strong> Adicione as seguintes variáveis no arquivo <code>.env</code>:
                  <pre className="mt-2 p-2 bg-muted rounded text-xs">
{`TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890`}
                  </pre>
                  <p className="mt-2 text-sm">
                    Consulte o arquivo <code>TWILIO_SMS_SETUP.md</code> para instruções detalhadas.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
