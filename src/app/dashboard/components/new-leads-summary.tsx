"use client"

import { useLeads } from "@/hooks/queries/use-leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Users, TrendingUp, Clock, Eye } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function NewLeadsSummary() {
  const { data: leads = [], isLoading } = useLeads()
  const router = useRouter()

  // Filtrar apenas leads novos
  const newLeads = leads.filter(lead => lead.status === "Novo")
  
  // Agrupar por fonte
  const leadsBySource = newLeads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Leads mais recentes (últimos 3)
  const recentLeads = newLeads
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Novos Leads</h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {newLeads.length}
            </Badge>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/leads')}
        >
          Ver todos
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de novos leads */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{newLeads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads de hoje */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">
                  {newLeads.filter(lead => {
                    const today = new Date()
                    const leadDate = new Date(lead.createdAt)
                    return leadDate.toDateString() === today.toDateString()
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fonte principal */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Principal</p>
                <p className="text-lg font-bold">
                  {Object.keys(leadsBySource).length > 0 
                    ? Object.entries(leadsBySource).sort(([,a], [,b]) => b - a)[0][0]
                    : "—"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de crescimento */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Crescimento</p>
                <p className="text-lg font-bold text-green-600">+12%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      
    </div>
  )
}
