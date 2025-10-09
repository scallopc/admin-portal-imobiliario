"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { MessageSquare, AlertTriangle, Clock, Users, Loader2, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface FollowUpStats {
  total: number
  overdue: number
  today: number
  inProgress: number
}

interface FollowUpLead {
  id: string
  name: string
  status: string
  source: string
  nextContact: string
  createdAt: string
  updatedAt: string
}

export default function FollowUpSummary() {
  const [stats, setStats] = useState<FollowUpStats | null>(null)
  const [recentLeads, setRecentLeads] = useState<FollowUpLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchFollowUpData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/follow-up')
      const result = await response.json()
      
      if (result.success && result.data) {
        const leads = result.data.leads || []
        const today = new Date()
        
        // Calcular estatísticas
        const overdue = leads.filter((lead: FollowUpLead) => {
          const nextContact = new Date(lead.nextContact)
          return nextContact < today
        }).length
        
        const todayLeads = leads.filter((lead: FollowUpLead) => {
          const nextContact = new Date(lead.nextContact)
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
          return nextContact >= todayStart && nextContact < todayEnd
        }).length
        
        const inProgress = leads.filter((lead: FollowUpLead) => 
          lead.status === 'Contatado' || lead.status === 'Qualificado'
        ).length
        
        setStats({
          total: leads.length,
          overdue,
          today: todayLeads,
          inProgress
        })

        // Leads mais recentes (últimos 3)
        const recent = leads
          .sort((a: FollowUpLead, b: FollowUpLead) => 
            new Date(b.nextContact).getTime() - new Date(a.nextContact).getTime()
          )
          .slice(0, 3)
        
        setRecentLeads(recent)
      } else {
        setError(result.error || 'Erro ao carregar dados de follow-up')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFollowUpData()
  }, [])

  const getPriorityColor = (lead: FollowUpLead) => {
    const nextContact = new Date(lead.nextContact)
    const today = new Date()
    const diffDays = Math.ceil((nextContact.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return "text-red-600"
    if (diffDays === 0) return "text-orange-600"
    if (diffDays <= 2) return "text-yellow-600"
    return "text-green-600"
  }

  const getPriorityText = (lead: FollowUpLead) => {
    const nextContact = new Date(lead.nextContact)
    const today = new Date()
    const diffDays = Math.ceil((nextContact.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return "Atrasado"
    if (diffDays === 0) return "Hoje"
    if (diffDays <= 2) return "Urgente"
    return "Normal"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Follow-up</h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {stats?.total || 0}
            </Badge>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/follow-up')}
        >
          Ver todos
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de follow-ups */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atrasados */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
                <p className="text-2xl font-bold text-red-600">{stats?.overdue || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hoje */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.today || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Em andamento */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-green-600">{stats?.inProgress || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads que precisam de follow-up */}
      {recentLeads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximos Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {lead.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{lead.source}</span>
                        <span>•</span>
                        <span className={getPriorityColor(lead)}>
                          {getPriorityText(lead)}
                        </span>
                        <span>•</span>
                        <span>{format(new Date(lead.nextContact), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/follow-up')}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

