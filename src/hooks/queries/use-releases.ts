import { useQuery, queryOptions } from '@tanstack/react-query'
import { type Release } from '@/schemas/release'

export const releasesQueryKey = () => ["releases"] as const;
export const releaseQueryKey = (id: string) => ["release", id] as const;

export function useReleases() {
  return useQuery(
    queryOptions({
      queryKey: releasesQueryKey(),
      queryFn: async () => {
        const res = await fetch('/api/releases', { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        if (!res.ok) throw new Error('Falha ao carregar lançamentos')
        return (await res.json()) as Release[]
      },
      staleTime: 0, // Dados sempre considerados stale
      gcTime: 5 * 60 * 1000, // 5 minutos no cache
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    })
  );
}

export function useRelease(id: string) {
  return useQuery({
    queryKey: releaseQueryKey(id),
    queryFn: async () => {
      const res = await fetch(`/api/releases/${id}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao carregar lançamento')
      return (await res.json()) as Release | null
    },
    enabled: !!id,
  })
}
