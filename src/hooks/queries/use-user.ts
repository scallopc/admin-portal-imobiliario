import { useQuery, queryOptions } from '@tanstack/react-query'
import { getUser } from '@/actions/get-user'

export function useUser() {
  return useQuery(
    queryOptions({
      queryKey: ['user'],
      queryFn: async () => {
        try {
          return await getUser()
        } catch (error) {
          console.error('Erro ao buscar usuário:', error)
          return null
        }
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: false, // Não tentar novamente automaticamente
      refetchOnWindowFocus: false, // Não refazer query ao focar na janela
      refetchOnMount: false, // Não refazer query ao montar o componente
    })
  )
}

export const userQueryKey = () => ['user'] as const
