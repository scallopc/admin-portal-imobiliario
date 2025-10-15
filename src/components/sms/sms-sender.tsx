"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSendSms } from "@/hooks/mutations/use-send-sms";
import { sendSmsSchema, type SendSmsInput } from "@/actions/twilio-sms/schema";
import { SMS_TEMPLATES } from "@/actions/twilio-sms";
import { PatternFormat } from "react-number-format";
import {
  Send,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2,
  Phone,
  FileText,
  DollarSign
} from "lucide-react";

interface SmsSenderProps {
  defaultPhone?: string;
  leadId?: string;
  leadName?: string;
  onMessageSent?: (messageId: string, phone: string, message: string) => void;
  className?: string;
}

export function SmsSender({
  defaultPhone = "",
  leadId,
  leadName,
  onMessageSent,
  className = ""
}: SmsSenderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [lastSentMessage, setLastSentMessage] = useState<{
    messageId: string;
    phone: string;
    message: string;
    timestamp: Date;
    cost?: number;
  } | null>(null);

  const sendSmsMutation = useSendSms();

  const form = useForm<SendSmsInput>({
    resolver: zodResolver(sendSmsSchema),
    defaultValues: {
      to: defaultPhone,
      message: "",
      leadId: leadId
    }
  });

  const onSubmit = (data: SendSmsInput) => {
    sendSmsMutation.mutate(data, {
      onSuccess: (result) => {
        if (result.success && result.messageId) {
          setLastSentMessage({
            messageId: result.messageId,
            phone: data.to,
            message: data.message,
            timestamp: new Date(),
            cost: result.cost
          });
          
          if (onMessageSent) {
            onMessageSent(result.messageId, data.to, data.message);
          }
          
          // Limpar apenas a mensagem, manter o telefone
          form.setValue("message", "");
          setSelectedTemplate("");
        }
      }
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (templateId && SMS_TEMPLATES[templateId as keyof typeof SMS_TEMPLATES]) {
      const template = SMS_TEMPLATES[templateId as keyof typeof SMS_TEMPLATES];
      let content = String(template.content);
      
      // Substituir variáveis básicas se disponíveis
      if (leadName) {
        content = content.replace(/{nome}/g, leadName);
      }
      
      form.setValue("message", content);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, "");
    
    // Adicionar +55 se não tiver código do país
    if (cleanPhone.length === 11 && !cleanPhone.startsWith("55")) {
      return `+55${cleanPhone}`;
    } else if (cleanPhone.length === 13 && cleanPhone.startsWith("55")) {
      return `+${cleanPhone}`;
    }
    
    return phone;
  };

  const getMessageLength = () => {
    const message = form.watch("message") || "";
    return message.length;
  };

  const getSmsCount = () => {
    const length = getMessageLength();
    if (length <= 160) return 1;
    return Math.ceil(length / 153); // SMS concatenados usam 153 caracteres por parte
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Enviar SMS via Twilio
        </CardTitle>
        <CardDescription>
          Envie SMS para follow-up de leads usando Twilio
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {lastSentMessage && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p>SMS enviado com sucesso!</p>
                <div className="text-xs text-muted-foreground">
                  <p>ID: {lastSentMessage.messageId}</p>
                  <p>Para: {lastSentMessage.phone}</p>
                  <p>Às: {lastSentMessage.timestamp.toLocaleString('pt-BR')}</p>
                  {lastSentMessage.cost && (
                    <p>Custo: ${lastSentMessage.cost.toFixed(4)}</p>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Número do Telefone
                  </FormLabel>
                  <FormControl>
                    <PatternFormat
                      format="+55 ## #####-####"
                      mask="_"
                      allowEmptyFormatting={false}
                      customInput={Input}
                      placeholder="+55 11 99999-9999"
                      value={field.value}
                      onValueChange={(values) => {
                        // Manter formato internacional
                        const formattedValue = formatPhoneNumber(values.value);
                        field.onChange(formattedValue);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Número com código do país (ex: +5511999999999)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Template de Mensagem
              </label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SMS_TEMPLATES).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite sua mensagem aqui..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center justify-between">
                    <span>
                      {getMessageLength()}/1600 caracteres • {getSmsCount()} SMS
                    </span>
                    {getSmsCount() > 1 && (
                      <Badge variant="outline" className="text-xs">
                        Mensagem longa
                      </Badge>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  ~${(getSmsCount() * 0.0075).toFixed(4)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Custo estimado
                </span>
              </div>
              
              <Button
                type="submit"
                disabled={sendSmsMutation.isPending || !form.watch("message")?.trim()}
                className="min-w-[120px]"
              >
                {sendSmsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar SMS
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {process.env.NODE_ENV === 'development' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Modo de Desenvolvimento</p>
                <p className="text-sm">
                  Configure as variáveis de ambiente do Twilio:
                </p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• TWILIO_ACCOUNT_SID</li>
                  <li>• TWILIO_AUTH_TOKEN</li>
                  <li>• TWILIO_PHONE_NUMBER</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
