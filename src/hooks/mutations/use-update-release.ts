import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getReleaseDetailsQueryKey } from '@/hooks/queries/use-release-details'

export type UpdateReleaseInput = {
  id: string
  title?: string
  slug?: string
  description?: string
  images?: string[]
  floorPlans?: string[]
  developer?: string
  status?: string
  seo?: string
  features?: string[]
  videoUrl?: string
  virtualTourUrl?: string
  delivery: string
  address?: {
    city?: string
    state?: string
    street?: string
    neighborhood?: string
  }
}

export function getUpdateReleaseMutationKey() {
  return ['update-release'] as const
}

export function useUpdateRelease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: getUpdateReleaseMutationKey(),
    mutationFn: async (payload: UpdateReleaseInput) => {
      const { id, ...rest } = payload;
      if (!id) {
        throw new Error('ID do lançamento é obrigatório para atualização');
      }
      const res = await fetch(`/api/releases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Falha ao atualizar lançamento')
      }
      return await res.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: getReleaseDetailsQueryKey(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['releases', 'list'] }); // Invalida a lista geral também
    },
  })
}

