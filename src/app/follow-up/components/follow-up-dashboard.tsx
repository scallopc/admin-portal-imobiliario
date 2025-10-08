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

      // Enviar mensagem via WhatsApp
      const response = await fetch("/api/whatsapp/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: lead.phone,
          leadId: lead.id,
          leadName: lead.name,
          leadStatus: lead.status,
          leadSource: lead.source,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`✅ Mensagem WhatsApp enviada para ${lead.name}!`);
        // Atualizar dados após envio bem-sucedido
        fetchFollowUpData();
      } else {
        toast.error(result.error || "Erro ao enviar mensagem WhatsApp");
      }
    } catch (err) {
      toast.error("Erro de conexão com WhatsApp");
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

    const confirmed = confirm(`Enviar mensagem WhatsApp para todos os ${data.leads.length} leads?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      toast.loading("Enviando mensagens...", { id: "send-all" });

      const response = await fetch("/api/whatsapp/send-follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendToAll: true }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`✅ ${result.data.sentMessages} mensagens enviadas com sucesso!`, { id: "send-all" });
        fetchFollowUpData();
      } else {
        toast.error(result.error || "Erro ao enviar mensagens em lote", { id: "send-all" });
      }
    } catch (err) {
      toast.error("Erro de conexão com WhatsApp", { id: "send-all" });
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Follow-up de Leads
              </CardTitle>
              <CardDescription>{data.total} leads precisam de follow-up</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchFollowUpData} disabled={loading}>
                <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>

              {data && data.leads.length > 0 && (
                <Button variant="default" size="sm" onClick={handleSendAllMessages} disabled={loading}>
                  <Send className="mr-1 h-4 w-4" />
                  Enviar para Todos
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <User className="text-muted-foreground h-4 w-4" />
                        <span className="font-semibold">{lead.name}</span>
                        <Badge variant={getPriorityColor(lead.nextContact)}>{getPriorityText(lead.nextContact)}</Badge>
                      </div>

                      <div className="text-muted-foreground grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(lead.nextContact), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <Badge variant="outline">{lead.status}</Badge>
                        <Badge variant="outline">{lead.source}</Badge>
                      </div>
                    </div>

                    <div className="ml-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleSendMessage(lead.id)}
                        disabled={sendingMessages.has(lead.id)}
                      >
                        {sendingMessages.has(lead.id) ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-1 h-4 w-4" />
                        )}
                        {sendingMessages.has(lead.id) ? "Enviando..." : "Enviar Mensagem"}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="h-4 w-4" />
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
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
