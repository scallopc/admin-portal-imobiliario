"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadListItem } from "@/actions/list-leads/schema"
import { Calendar, Mail, Phone, User, FileText, Globe, TrendingUp } from "lucide-react"

interface LeadViewProps {
  lead: LeadListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const stageColors = {
  "Novo": "bg-blue-100 text-blue-800",
  "Contactado": "bg-yellow-100 text-yellow-800",
  "Qualificado": "bg-orange-100 text-orange-800",
  "Ganho": "bg-green-100 text-green-800",
  "Perdido": "bg-red-100 text-red-800"
}

export function LeadView({ lead, open, onOpenChange }: LeadViewProps) {
  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto light-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Visualizar Lead
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
 
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-lg font-semibold">{lead.name}</p>
              </div>

              {lead.email && (
               <div className="flex gap-2 flex-col">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                  </div>
                    <p className="text-base">{lead.email}</p>
                </div>
              )}

              {lead.phone && (
                <div className="flex gap-2 flex-col">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  </div>
                  <p className="text-base">{lead.phone}</p>
                </div>
               
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="space-y-4">
            <div className="flex gap-2 flex-col">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                </div>
                <Badge className={stageColors[lead.stage as keyof typeof stageColors]}>
                  {lead.stage}
                </Badge>
              </div>

              <div className="flex gap-2 flex-col">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Origem</label>
                </div>
                <p className="text-base">{lead.source}</p>
              </div>
            </CardContent>
          </Card>

          {lead.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base whitespace-pre-wrap">{lead.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="space-y-2">
              <div className="flex gap-2 flex-col">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">Criado em</label>
              </div>
                <p className="text-base">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '—'}
                </p>
              </div>
              <div className="flex gap-2 flex-col">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">Atualizado em</label>
              </div>
                <p className="text-base">
                  {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '—'}
                </p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
