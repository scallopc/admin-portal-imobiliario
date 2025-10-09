import { useMutation, useQueryClient } from '@tanstack/react-query'
import { releasesQueryKey } from '@/hooks/queries/use-releases'

export type CreateReleaseInput = {
  title: string
  slug: string
  description: string
  developer?: string
  status: string
  propertyType: string
  city: string
  neighborhood: string
  images: (string | File)[]
  floorPlans?: (string | File)[]
  seo?: string
  features: string[]
  videoUrl?: string
  virtualTourUrl?: string
  delivery: string
}

export function getCreateReleaseMutationKey() {
  return ['create-release'] as const
}

export function useCreateRelease() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationKey: getCreateReleaseMutationKey(),
    mutationFn: async (payload: CreateReleaseInput) => {
      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Falha ao criar lançamento')
      }
      
      return await res.json()
    },
    onSuccess: () => {
      // Invalidar cache para forçar recarregamento
      queryClient.invalidateQueries({ queryKey: releasesQueryKey() })
      // Também refetch para garantir dados atualizados
      queryClient.refetchQueries({ queryKey: releasesQueryKey() })
    }
  })
}
