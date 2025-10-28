"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SmsSender, SmsStatus } from "@/components/sms";
import { useSendSms } from "@/hooks/mutations/use-send-sms";
import { SMS_TEMPLATES } from "@/actions/send-sms";
import {
  MessageSquare,
  Send,
  Loader2,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface FollowUpLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  nextContact: string;
  createdAt: string;
  updatedAt: string;
}

interface FollowUpSmsIntegrationProps {
  leads: FollowUpLead[];
  onLeadUpdate?: () => void;
}

export function FollowUpSmsIntegration({ leads, onLeadUpdate }: FollowUpSmsIntegrationProps) {
  const [selectedLead, setSelectedLead] = useState<FollowUpLead | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [sendingBulk, setSendingBulk] = useState(false);
  const [sentMessages, setSentMessages] = useState<{
    leadId: string;
    messageId: string;
    timestamp: Date;
  }[]>([]);

  const sendSmsMutation = useSendSms();

  const formatPhoneForSms = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, "");
    
    // Adicionar +55 se não tiver código do país
    if (cleanPhone.length === 11 && !cleanPhone.startsWith("55")) {
      return `+55${cleanPhone}`;
    } else if (cleanPhone.length === 13 && cleanPhone.startsWith("55")) {
      return `+${cleanPhone}`;
    }
    
    return `+${cleanPhone}`;
  };

  const processTemplate = (templateContent: string, lead: FollowUpLead) => {
    return templateContent
      .replace(/{nome}/g, lead.name)
      .replace(/{corretor}/g, "Equipe Imobiliária")
      .replace(/{imobiliaria}/g, "Portal Imobiliário")
      .replace(/{imovel}/g, "imóvel de interesse")
      .replace(/{disponibilidade}/g, "esta semana")
      .replace(/{valor}/g, "consulte valores")
      .replace(/{horario}/g, "horário combinado")
      .replace(/{endereco}/g, "endereço do imóvel");
  };

  const handleSendSingleSms = async (lead: FollowUpLead, message: string) => {
    const formattedPhone = formatPhoneForSms(lead.phone);
    
    sendSmsMutation.mutate({
      to: formattedPhone,
      message,
      leadId: lead.id
    }, {
      onSuccess: (result) => {
        if (result.success && result.messageId) {
          setSentMessages(prev => [...prev, {
            leadId: lead.id,
            messageId: result.messageId!,
            timestamp: new Date()
          }]);
          
          if (onLeadUpdate) {
            onLeadUpdate();
          }
        }
      }
    });
  };

  const handleBulkSms = async () => {
    if (!selectedTemplate) {
      toast.error("Selecione um template para envio em lote");
      return;
    }

    const confirmed = confirm(`Enviar SMS para todos os ${leads.length} leads?`);
    if (!confirmed) return;

    setSendingBulk(true);
    let successCount = 0;
    let errorCount = 0;

    toast.loading(`Enviando SMS para ${leads.length} leads...`, { id: "bulk-sms" });

    for (const lead of leads) {
      try {
        const template = SMS_TEMPLATES[selectedTemplate as keyof typeof SMS_TEMPLATES];
        const message = processTemplate(template.content, lead);
        const formattedPhone = formatPhoneForSms(lead.phone);

        const response = await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: formattedPhone,
            message,
            leadId: lead.id
          })
        });

        const result = await response.json();

        if (result.success) {
          successCount++;
          setSentMessages(prev => [...prev, {
            leadId: lead.id,
            messageId: result.messageId,
            timestamp: new Date()
          }]);
        } else {
          errorCount++;
        }

        // Delay entre envios para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        errorCount++;
        console.error(`Erro ao enviar SMS para ${lead.name}:`, error);
      }
    }

    setSendingBulk(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} SMS enviados com sucesso!`, { id: "bulk-sms" });
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} SMS falharam no envio`, { id: "bulk-sms" });
    }

    if (onLeadUpdate) {
      onLeadUpdate();
    }
  };

  const getPriorityColor = (nextContact: string) => {
    const daysDiff = Math.ceil((new Date().getTime() - new Date(nextContact).getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 3) return "destructive";
    if (daysDiff > 1) return "secondary";
    return "default";
  };

  const getPriorityIcon = (nextContact: string) => {
    const daysDiff = Math.ceil((new Date().getTime() - new Date(nextContact).getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 3) return <AlertTriangle className="h-3 w-3" />;
    if (daysDiff > 1) return <Clock className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  const getMessageForLead = (leadId: string) => {
    return sentMessages.find(msg => msg.leadId === leadId);
  };

  return (
    <div className="space-y-6">
      {/* Header com ações em lote */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Follow-up via SMS
              </CardTitle>
              <CardDescription>
                Envie SMS personalizados para seus leads (DEV MODE)
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SMS_TEMPLATES).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleBulkSms}
                disabled={!selectedTemplate || sendingBulk || leads.length === 0}
                className="flex items-center gap-2"
              >
                {sendingBulk ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Enviar para Todos ({leads.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de leads */}
      <div className="grid gap-4">
        {leads.map((lead) => {
          const sentMessage = getMessageForLead(lead.id);
          
          return (
            <Card key={lead.id} className="relative">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(lead.nextContact)}
                      <Badge variant={getPriorityColor(lead.nextContact)}>
                        {Math.ceil((new Date().getTime() - new Date(lead.nextContact).getTime()) / (1000 * 60 * 60 * 24))} dias
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">{lead.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(lead.nextContact), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {sentMessage ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          SMS Enviado
                        </Badge>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Ver Status
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Status do SMS - {lead.name}</DialogTitle>
                              <DialogDescription>
                                Acompanhe o status de entrega do SMS
                              </DialogDescription>
                            </DialogHeader>
                            <SmsStatus
                              messageId={sentMessage.messageId}
                              phoneNumber={lead.phone}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={sendSmsMutation.isPending}
                          >
                            {sendSmsMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Enviar SMS
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Enviar SMS - {lead.name}</DialogTitle>
                            <DialogDescription>
                              Envie um SMS personalizado para este lead
                            </DialogDescription>
                          </DialogHeader>
                          
                          <SmsSender
                            defaultPhone={formatPhoneForSms(lead.phone)}
                            leadId={lead.id}
                            leadName={lead.name}
                            onMessageSent={(messageId) => {
                              setSentMessages(prev => [...prev, {
                                leadId: lead.id,
                                messageId,
                                timestamp: new Date()
                              }]);
                              
                              if (onLeadUpdate) {
                                onLeadUpdate();
                              }
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {leads.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="mb-4 text-6xl">📱</div>
            <h3 className="mb-2 text-lg font-semibold">Nenhum lead para follow-up</h3>
            <p className="text-muted-foreground">
              Quando houver leads pendentes, você poderá enviar SMS aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
