"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSmsStatus } from "@/hooks/queries/use-sms-status";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  MessageSquare,
  Loader2
} from "lucide-react";

interface SmsStatusProps {
  messageId: string;
  phoneNumber?: string;
  message?: string;
  className?: string;
}

export function SmsStatus({
  messageId,
  phoneNumber,
  message,
  className = ""
}: SmsStatusProps) {
  const { 
    data: status, 
    isLoading, 
    error,
    refetch 
  } = useSmsStatus(messageId);

  const getStatusIcon = (statusValue?: string) => {
    switch (statusValue) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'undelivered':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (statusValue?: string) => {
    switch (statusValue) {
      case 'delivered':
        return <Badge className="bg-green-500">Entregue</Badge>;
      case 'sent':
        return <Badge className="bg-blue-500">Enviado</Badge>;
      case 'queued':
        return <Badge variant="secondary">Na Fila</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'undelivered':
        return <Badge variant="destructive">Não Entregue</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusDescription = (statusValue?: string) => {
    switch (statusValue) {
      case 'delivered':
        return "SMS foi entregue com sucesso ao destinatário";
      case 'sent':
        return "SMS foi enviado pela operadora";
      case 'queued':
        return "SMS está na fila para envio";
      case 'failed':
        return "Falha no envio do SMS";
      case 'undelivered':
        return "SMS não pôde ser entregue";
      default:
        return "Status desconhecido";
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Consultando status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Erro ao consultar status</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Status do SMS
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Atualizar
          </Button>
        </div>
        <CardDescription>
          ID: {messageId}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status?.status)}
            <span className="font-medium">Status:</span>
          </div>
          {getStatusBadge(status?.status)}
        </div>

        <p className="text-sm text-muted-foreground">
          {getStatusDescription(status?.status)}
        </p>

        {phoneNumber && (
          <div className="text-sm">
            <span className="font-medium">Para:</span> {phoneNumber}
          </div>
        )}

        {message && (
          <div className="text-sm">
            <span className="font-medium">Mensagem:</span>
            <p className="mt-1 p-2 bg-muted rounded text-xs">
              {message.length > 100 ? `${message.substring(0, 100)}...` : message}
            </p>
          </div>
        )}

        {status && (
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Criado:</span>
              <br />
              {new Date(status.dateCreated).toLocaleString('pt-BR')}
            </div>
            {status.dateSent && (
              <div>
                <span className="font-medium">Enviado:</span>
                <br />
                {new Date(status.dateSent).toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        )}

        {status?.errorCode && (
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Erro {status.errorCode}</span>
            </div>
            {status.errorMessage && (
              <p className="text-sm text-red-600 mt-1">
                {status.errorMessage}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
