"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Phone, MessageSquare, Calendar, User, Send, RefreshCw, Loader2, MoreHorizontal } from "lucide-react";
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

interface FollowUpData {
  leads: FollowUpLead[];
  total: number;
  message: string;
}

export function FollowUpDashboard() {
  const [data, setData] = useState<FollowUpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessages, setSendingMessages] = useState<Set<string>>(new Set());

  const fetchFollowUpData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/follow-up");
      const result = await response.json();

      if (result.success && result.data && result.data.leads) {
        setData(result.data);
      } else {
        setError(result.error || "Erro ao carregar dados");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUpData();
  }, []);

  const handleAction = async (leadId: string, action: string, notes?: string) => {
    try {
      const response = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, action, notes }),
      });

      const result = await response.json();

      if (result.success) {
        // Recarregar dados
        fetchFollowUpData();
      } else {
        setError(result.error || "Erro ao processar ação");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const handleSendMessage = async (leadId: string) => {
    try {
      // Adicionar lead ao loading
      setSendingMessages(prev => new Set(prev).add(leadId));

      // Buscar dados do lead para enviar mensagem personalizada
      const lead = data?.leads.find(l => l.id === leadId);
      if (!lead) {
        toast.error("Lead não encontrado");
        return;
      }

      // Enviar mensagem via SMS
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: lead.phone,
          message: `Olá ${lead.name}! Estamos entrando em contato sobre seu interesse em nossos imóveis. Nossa equipe está à disposição para esclarecer dúvidas e agendar uma visita. Entre em contato conosco! zonasullancamentos.com.br`,
          leadId: lead.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`✅ SMS enviado para ${lead.name}!`);
        // Atualizar dados após envio bem-sucedido
        fetchFollowUpData();
      } else {
        toast.error(result.error || "Erro ao enviar SMS");
      }
    } catch (err) {
      toast.error("Erro de conexão com SMS");
    } finally {
      // Remover lead do loading
      setSendingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    }
  };

  const handleSendAllMessages = async () => {
    if (!data?.leads || data.leads.length === 0) {
      toast.error("Nenhum lead para enviar mensagem");
      return;
    }

    const confirmed = confirm(`Enviar SMS para todos os ${data.leads.length} leads?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      toast.loading("Enviando mensagens...", { id: "send-all" });

      const response = await fetch("/api/sms/send-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leads: data.leads.map(lead => ({
            to: lead.phone,
            message: `Olá ${lead.name}! Estamos entrando em contato sobre seu interesse em nossos imóveis. Nossa equipe está à disposição para esclarecer dúvidas e agendar uma visita. Entre em contato conosco!`,
            leadId: lead.id
          }))
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`✅ ${result.data.sentMessages || result.data.sent || data.leads.length} SMS enviados com sucesso!`, { id: "send-all" });
        fetchFollowUpData();
      } else {
        toast.error(result.error || "Erro ao enviar SMS em lote", { id: "send-all" });
      }
    } catch (err) {
      toast.error("Erro de conexão com SMS", { id: "send-all" });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (nextContact: string) => {
    const daysDiff = Math.ceil((new Date().getTime() - new Date(nextContact).getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 3) return "destructive";
    if (daysDiff > 1) return "secondary";
    return "default";
  };

  const getPriorityText = (nextContact: string) => {
    const daysDiff = Math.ceil((new Date().getTime() - new Date(nextContact).getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 3) return "Alta Prioridade";
    if (daysDiff > 1) return "Média Prioridade";
    return "Baixa Prioridade";
  };

  if (!data || data.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Follow-up de Leads
          </CardTitle>
          <CardDescription>Sistema de follow-up automatizado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="mb-4 text-6xl">✅</div>
            <h3 className="mb-2 text-lg font-semibold">Nenhum follow-up pendente!</h3>
            <p className="text-muted-foreground">Todos os leads estão em dia com o cronograma de contato.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Follow-up de Leads
              </CardTitle>
              <CardDescription>{data.total} leads precisam de follow-up</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" size="sm" onClick={fetchFollowUpData} disabled={loading}>
                <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Atualizar</span>
                <span className="sm:hidden">Atualizar</span>
              </Button>

              {data && data.leads.length > 0 && (
                <Button variant="default" size="sm" onClick={handleSendAllMessages} disabled={loading}>
                  <Send className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Enviar para Todos</span>
                  <span className="sm:hidden">Enviar Todos</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {data.leads.map(lead => (
              <Card key={lead.id} className="border-l-primary border-l-4">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                          <div className="flex items-center gap-2">
                            <User className="text-muted-foreground h-4 w-4" />
                            <span className="font-semibold">{lead.name}</span>
                          </div>
                          <Badge variant={getPriorityColor(lead.nextContact)} className="w-fit">
                            {getPriorityText(lead.nextContact)}
                          </Badge>
                        </div>

                        <div className="text-muted-foreground grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{lead.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{format(new Date(lead.nextContact), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant="outline">{lead.status}</Badge>
                          <Badge variant="outline">{lead.source}</Badge>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:ml-4 sm:flex-row">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleSendMessage(lead.id)}
                          disabled={sendingMessages.has(lead.id)}
                          className="w-full sm:w-auto"
                        >
                          {sendingMessages.has(lead.id) ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="mr-1 h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">
                            {sendingMessages.has(lead.id) ? "Enviando..." : "Enviar SMS"}
                          </span>
                          <span className="sm:hidden">
                            {sendingMessages.has(lead.id) ? "Enviando..." : "SMS"}
                          </span>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="ml-1 sm:hidden">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAction(lead.id, "contacted")}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Marcar como Contatado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(lead.id, "qualified")}>
                              <User className="mr-2 h-4 w-4" />
                              Marcar como Qualificado
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleAction(lead.id, "lost")}
                              className="text-destructive focus:text-destructive"
                            >
                              Marcar como Perdido
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
