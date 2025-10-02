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
  address?: {
    city?: string
    state?: string
    street?: string
    neighborhood?: string
  }
}

export function getUpdateReleaseMutationKey(id: string) {
  return ['update-release', id] as const
}

export function useUpdateRelease(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: getUpdateReleaseMutationKey(id),
    mutationFn: async (payload: UpdateReleaseInput) => {
      const res = await fetch(`/api/releases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Falha ao atualizar lançamento')
      }
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getReleaseDetailsQueryKey(id) })
    },
  })
}

