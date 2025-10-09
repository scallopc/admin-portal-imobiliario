import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const followUpQueryKey = () => ['follow-up'] as const

export function useFollowUp() {
  return useQuery({
    queryKey: followUpQueryKey(),
    queryFn: async () => {
      const response = await fetch('/api/follow-up')
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar follow-up')
      }
      
      return data.data
    },
    refetchInterval: 30000, // Refetch a cada 30 segundos
    staleTime: 10000, // Considera dados stale após 10 segundos
  })
}

export function useFollowUpAction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ leadId, action, notes }: { 
      leadId: string
      action: string
      notes?: string 
    }) => {
      const response = await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, action, notes })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao processar ação')
      }
      
      return data
    },
    onSuccess: () => {
      // Invalidar e recarregar dados do follow-up
      queryClient.invalidateQueries({ queryKey: followUpQueryKey() })
      // Também invalidar dados de leads
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useFollowUpStats() {
  return useQuery({
    queryKey: [...followUpQueryKey(), 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/follow-up')
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar estatísticas')
      }
      
      const leads = data.data.leads || []
      
      // Calcular estatísticas
      const stats = {
        total: leads.length,
        byStage: leads.reduce((acc: Record<string, number>, lead: any) => {
          acc[lead.stage] = (acc[lead.stage] || 0) + 1
          return acc
        }, {}),
        byPriority: leads.reduce((acc: Record<string, number>, lead: any) => {
          const daysOverdue = Math.ceil(
            (new Date().getTime() - new Date(lead.proximo_contato).getTime()) / (1000 * 60 * 60 * 24)
          )
          
          let priority = 'baixa'
          if (daysOverdue > 3) priority = 'alta'
          else if (daysOverdue >= 1) priority = 'média'
          
          acc[priority] = (acc[priority] || 0) + 1
          return acc
        }, {}),
        overdue: leads.filter((lead: any) => {
          const daysOverdue = Math.ceil(
            (new Date().getTime() - new Date(lead.proximo_contato).getTime()) / (1000 * 60 * 60 * 24)
          )
          return daysOverdue > 0
        }).length
      }
      
      return stats
    },
    refetchInterval: 60000, // Refetch a cada minuto
  })
}
