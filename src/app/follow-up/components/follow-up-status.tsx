"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { MessageSquare, AlertTriangle, Clock, Users, Loader2 } from "lucide-react"

interface FollowUpStats {
  total: number
  overdue: number
  today: number
  inProgress: number
}

export function FollowUpStatus() {
  const [stats, setStats] = useState<FollowUpStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/follow-up')
      const result = await response.json()
      
      if (result.success && result.data) {
        const leads = result.data.leads || []
        const today = new Date()
        
        // Calcular estatísticas
        const overdue = leads.filter((lead: any) => {
          const nextContact = new Date(lead.nextContact)
          return nextContact < today
        }).length
        
        const todayLeads = leads.filter((lead: any) => {
          const nextContact = new Date(lead.nextContact)
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
          return nextContact >= todayStart && nextContact < todayEnd
        }).length
        
        const inProgress = leads.filter((lead: any) => 
          lead.status === 'Contatado' || lead.status === 'Qualificado'
        ).length
        
        setStats({
          total: leads.length,
          overdue,
          today: todayLeads,
          inProgress
        })
      } else {
        setError(result.error || 'Erro ao carregar estatísticas')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-8 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="col-span-full">
          <CardContent className="p-6">
            <div className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Follow-ups</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
          <p className="text-xs text-muted-foreground">
            Leads aguardando contato
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stats?.overdue || 0}</div>
          <p className="text-xs text-muted-foreground">
            Follow-ups em atraso
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats?.today || 0}</div>
          <p className="text-xs text-muted-foreground">
            Follow-ups para hoje
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats?.inProgress || 0}</div>
          <p className="text-xs text-muted-foreground">
            Leads em negociação
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

