import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getReleaseDetailsQueryKey } from '@/hooks/queries/use-release-details'

export type UpdateUnitInput = {
  releaseId: string
  unitId: string
  data: Record<string, any>
}

export function getUpdateUnitMutationKey(releaseId: string, unitId: string) {
  return ['update-unit', releaseId, unitId] as const
}

export function useUpdateUnit(releaseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['update-unit', releaseId],
    mutationFn: async (input: UpdateUnitInput) => {
      const res = await fetch(`/api/releases/${input.releaseId}/units/${input.unitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input.data),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Falha ao atualizar unidade')
      }
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getReleaseDetailsQueryKey(releaseId) })
    },
  })
}
