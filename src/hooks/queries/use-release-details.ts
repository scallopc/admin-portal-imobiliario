import { useQuery } from '@tanstack/react-query'
import { releaseSchema, type Release } from '@/schemas/release'


export function getReleaseDetailsQueryKey(id: string) {
  return ['release-details', id] as const
}

export function useReleaseDetails(id: string) {
  return useQuery({
    queryKey: getReleaseDetailsQueryKey(id),
    queryFn: async (): Promise<Release> => {
      const res = await fetch(`/api/releases/${id}`, { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Falha ao carregar detalhes do lançamento')
      }
      return res.json()
    },
    enabled: !!id,
  })
}
